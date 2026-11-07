-- =====================================================================
-- Firm Website CMS — V1 schema
--
-- Five new tables. NO changes to existing tables, policies, grants, or
-- functions. Reuses public.update_updated_at_column() and public.has_role().
--
-- Access model:
--   * Owner (the law firm's own login) — full CRUD via auth.uid() = user_id
--   * Platform admin — read/write via has_role(auth.uid(), 'admin')
--   * Public renderer — NO anon policies. The edge renderer reads with the
--     service role, so a leaked anon key grants nothing here and the domain
--     verification token is never publicly readable.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. firm_sites — one website per row, owned by one login
-- ---------------------------------------------------------------------
CREATE TABLE public.firm_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  firm_name TEXT NOT NULL,

  -- Hostnames. subdomain is always present; custom_domain is optional and
  -- only serves traffic once custom_domain_verified_at is set.
  subdomain TEXT NOT NULL UNIQUE
    CHECK (subdomain ~ '^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])$'),
  custom_domain TEXT UNIQUE
    CHECK (custom_domain IS NULL OR custom_domain ~ '^[a-z0-9.-]+\.[a-z]{2,}$'),
  custom_domain_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::TEXT, '-', ''),
  custom_domain_verified_at TIMESTAMP WITH TIME ZONE,

  -- Brand tokens consumed by the renderer (colors, fonts, logo_url, radius).
  brand JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Publish state. is_published gates whether the renderer serves anything.
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. firm_site_pages
-- ---------------------------------------------------------------------
CREATE TABLE public.firm_site_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.firm_sites(id) ON DELETE CASCADE,

  slug TEXT NOT NULL CHECK (slug ~ '^[a-z0-9]([a-z0-9/-]{0,98}[a-z0-9])?$'),
  title TEXT NOT NULL,
  meta_description TEXT,
  -- The home page carries slug 'home'; the renderer maps "/" to is_home.
  is_home BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  UNIQUE (site_id, slug)
);

-- Exactly one home page per site.
CREATE UNIQUE INDEX firm_site_pages_one_home
  ON public.firm_site_pages (site_id) WHERE is_home;

-- ---------------------------------------------------------------------
-- 3. firm_site_sections — the renderer's only content source
-- ---------------------------------------------------------------------
CREATE TABLE public.firm_site_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.firm_site_pages(id) ON DELETE CASCADE,

  -- V1 section vocabulary. TEXT + CHECK rather than an enum so the list can
  -- grow with a one-line ALTER instead of an enum migration.
  section_type TEXT NOT NULL CHECK (section_type IN (
    'hero',
    'about',
    'practice_areas',
    'attorney_bio',
    'testimonials',
    'faq',
    'contact',
    'cta'
  )),

  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. firm_site_leads — contact-form submissions from published sites
--    Written only by the renderer (service role). No anon access.
-- ---------------------------------------------------------------------
CREATE TABLE public.firm_site_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.firm_sites(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.firm_site_pages(id) ON DELETE SET NULL,

  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,

  -- Provenance for abuse triage (the renderer sees the true client IP).
  source_ip TEXT,
  user_agent TEXT,

  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 5. firm_site_publishes — publish history + rollback snapshots
-- ---------------------------------------------------------------------
CREATE TABLE public.firm_site_publishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.firm_sites(id) ON DELETE CASCADE,
  published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Full page+section tree at publish time, so a bad publish can be reverted.
  snapshot JSONB NOT NULL,
  note TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- Indexes — FK lookups and the renderer's hostname resolution
-- ---------------------------------------------------------------------
CREATE INDEX firm_sites_user_id_idx           ON public.firm_sites (user_id);
CREATE INDEX firm_site_pages_site_id_idx      ON public.firm_site_pages (site_id);
CREATE INDEX firm_site_sections_page_id_idx   ON public.firm_site_sections (page_id);
CREATE INDEX firm_site_leads_site_id_idx      ON public.firm_site_leads (site_id, created_at DESC);
CREATE INDEX firm_site_publishes_site_id_idx  ON public.firm_site_publishes (site_id, created_at DESC);

-- Hostname lookup: only published sites are ever resolved.
CREATE INDEX firm_sites_subdomain_live_idx ON public.firm_sites (subdomain)
  WHERE is_published;
CREATE INDEX firm_sites_custom_domain_live_idx ON public.firm_sites (custom_domain)
  WHERE is_published AND custom_domain_verified_at IS NOT NULL;

-- ---------------------------------------------------------------------
-- updated_at triggers (reusing the existing function)
-- ---------------------------------------------------------------------
CREATE TRIGGER firm_sites_set_updated_at
  BEFORE UPDATE ON public.firm_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER firm_site_pages_set_updated_at
  BEFORE UPDATE ON public.firm_site_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER firm_site_sections_set_updated_at
  BEFORE UPDATE ON public.firm_site_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- Row Level Security
-- =====================================================================
ALTER TABLE public.firm_sites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_site_pages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_site_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_site_leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_site_publishes  ENABLE ROW LEVEL SECURITY;

-- ---- firm_sites -----------------------------------------------------
-- Direct auth.uid() = user_id check, NOT a lookup through another table, so
-- that INSERT ... RETURNING on the first site row satisfies its own SELECT
-- policy. A join-based policy here would make site creation fail for every
-- real user while still working in the SQL editor.
CREATE POLICY "Firms can view their own site"
ON public.firm_sites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Firms can create their own site"
ON public.firm_sites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Firms can update their own site"
ON public.firm_sites FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Firms can delete their own site"
ON public.firm_sites FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sites"
ON public.firm_sites FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ---- firm_site_pages ------------------------------------------------
-- Ownership is derived from the parent site rather than denormalized onto
-- the child, so a bug cannot leave a page pointing at the wrong owner.
CREATE POLICY "Firms can manage pages on their own site"
ON public.firm_site_pages FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_pages.site_id AND s.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_pages.site_id AND s.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all pages"
ON public.firm_site_pages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ---- firm_site_sections ---------------------------------------------
CREATE POLICY "Firms can manage sections on their own site"
ON public.firm_site_sections FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.firm_site_pages p
  JOIN public.firm_sites s ON s.id = p.site_id
  WHERE p.id = firm_site_sections.page_id AND s.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.firm_site_pages p
  JOIN public.firm_sites s ON s.id = p.site_id
  WHERE p.id = firm_site_sections.page_id AND s.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all sections"
ON public.firm_site_sections FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ---- firm_site_leads ------------------------------------------------
-- Firms read and update (mark-read) their own leads. Nobody inserts through
-- PostgREST: inserts come from the renderer on the service role, which
-- bypasses RLS. That keeps the public web form off the anon key entirely and
-- puts rate limiting at the edge, where the real client IP is visible.
CREATE POLICY "Firms can view leads for their own site"
ON public.firm_site_leads FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_leads.site_id AND s.user_id = auth.uid()
));

CREATE POLICY "Firms can update leads for their own site"
ON public.firm_site_leads FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_leads.site_id AND s.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_leads.site_id AND s.user_id = auth.uid()
));

CREATE POLICY "Firms can delete leads for their own site"
ON public.firm_site_leads FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_leads.site_id AND s.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all leads"
ON public.firm_site_leads FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ---- firm_site_publishes --------------------------------------------
CREATE POLICY "Firms can view their own publish history"
ON public.firm_site_publishes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_publishes.site_id AND s.user_id = auth.uid()
));

CREATE POLICY "Firms can record a publish for their own site"
ON public.firm_site_publishes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.firm_sites s
  WHERE s.id = firm_site_publishes.site_id AND s.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all publish history"
ON public.firm_site_publishes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

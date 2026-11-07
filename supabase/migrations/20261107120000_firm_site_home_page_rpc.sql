-- Atomic home-page selection for firm websites.
--
-- PROBLEM
-- The admin UI changed the home page with two separate UPDATEs: clear the old
-- home row, then set the new one. firm_site_pages_one_home is a partial UNIQUE
-- index on (site_id) WHERE is_home, so the clear genuinely must land first --
-- but between the two statements the site has NO home page at all. The public
-- renderer resolves "/" with is_home = true, so a failure, a closed tab or a
-- dropped connection in that window leaves a live firm's homepage serving 404,
-- silently, until someone notices and clicks again.
--
-- A partial unique index cannot be deferred (only table constraints can, and
-- those cannot be partial), so the two statements stay. Putting them inside a
-- function makes them one transaction: either both land or neither does, and no
-- other session -- including the renderer -- ever observes the gap.
--
-- SECURITY INVOKER (the default) is deliberate. The function needs no elevated
-- rights: the existing RLS policies on firm_site_pages already restrict both
-- the SELECT and the UPDATEs to the site's owner or an admin, so ownership is
-- enforced by the same policies as every other write. A SECURITY DEFINER
-- function here would bypass RLS and have to re-implement that check by hand.
--
-- search_path is pinned empty and every object is schema-qualified, so the
-- function cannot be redirected by a caller's search_path.

CREATE OR REPLACE FUNCTION public.set_firm_site_home_page(p_page_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_site_id UUID;
BEGIN
  -- RLS applies: a caller who cannot see this page gets no row.
  SELECT site_id INTO v_site_id
  FROM public.firm_site_pages
  WHERE id = p_page_id;

  IF v_site_id IS NULL THEN
    RAISE EXCEPTION 'Page not found'
      USING ERRCODE = 'no_data_found',
            HINT = 'The page does not exist, or it belongs to another firm.';
  END IF;

  -- Clear first: the partial unique index permits only one is_home row per site.
  UPDATE public.firm_site_pages
  SET is_home = false
  WHERE site_id = v_site_id
    AND is_home
    AND id <> p_page_id;

  UPDATE public.firm_site_pages
  SET is_home = true
  WHERE id = p_page_id
    AND NOT is_home;

  -- An UPDATE blocked by RLS changes zero rows WITHOUT raising, which would
  -- hand the browser a silent success and a wrong home page. Confirm the end
  -- state instead of trusting the statements, and fail loudly if it is wrong --
  -- the whole function rolls back, so the original home page survives intact.
  IF NOT EXISTS (
    SELECT 1 FROM public.firm_site_pages WHERE id = p_page_id AND is_home
  ) THEN
    RAISE EXCEPTION 'Home page was not changed'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.set_firm_site_home_page(UUID) IS
  'Moves a firm site''s home page flag to the given page in one transaction. Runs as the caller, so RLS enforces ownership.';

-- Postgres grants EXECUTE on new functions to PUBLIC by default, which would
-- expose this to the anon role. Narrow it to signed-in users; RLS still decides
-- which rows they may touch.
REVOKE ALL ON FUNCTION public.set_firm_site_home_page(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_firm_site_home_page(UUID) TO authenticated;

-- Supabase's ALTER DEFAULT PRIVILEGES also grants EXECUTE on every new public
-- function to anon, authenticated and service_role, and REVOKE ... FROM PUBLIC
-- above does NOT remove those role-specific grants. Drop anon's explicitly.
-- (Not exploitable on its own -- SECURITY INVOKER plus no anon policy on
-- firm_site_pages means the lookup finds nothing -- but an unauthenticated role
-- should not hold EXECUTE on a site-mutating function.)
REVOKE ALL ON FUNCTION public.set_firm_site_home_page(UUID) FROM anon;

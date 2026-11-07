/**
 * publishSite.ts — Data operations behind the Publish / Unpublish buttons.
 *
 * Publishing is "snapshot then flip":
 *   1. read the full current page + section tree from the database
 *      (saved data only — unsaved drafts in the editor are NOT included),
 *   2. insert it as a row in firm_site_publishes (published_by = current user),
 *   3. set firm_sites.is_published = true and published_at.
 *
 * published_at is copied from the publish row's created_at, which the database
 * stamps with now(), so the timestamp is server time rather than the browser's
 * clock.
 *
 * Every query scopes by site_id / page_id; RLS restricts rows to the owner.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { FirmSite, FirmSitePublish } from "./types";

/** Shape stored in firm_site_publishes.snapshot. */
export interface SiteSnapshot {
  version: 1;
  site: { id: string; firm_name: string; subdomain: string; brand: Json };
  pages: {
    id: string;
    slug: string;
    title: string;
    meta_description: string | null;
    is_home: boolean;
    is_published: boolean;
    display_order: number;
    sections: {
      id: string;
      section_type: string;
      content: Json;
      display_order: number;
      is_visible: boolean;
    }[];
  }[];
}

/** Reads every page of the site and every section on those pages, in display order. */
export async function fetchSiteTree(site: FirmSite): Promise<SiteSnapshot> {
  const { data: pages, error: pagesError } = await supabase
    .from("firm_site_pages")
    .select("id, slug, title, meta_description, is_home, is_published, display_order")
    .eq("site_id", site.id)
    .order("display_order", { ascending: true });
  if (pagesError) throw new Error(`Couldn't read pages: ${pagesError.message}`);

  const pageIds = (pages ?? []).map((p) => p.id);
  let sections: { id: string; page_id: string; section_type: string; content: Json; display_order: number; is_visible: boolean }[] = [];
  if (pageIds.length > 0) {
    const { data, error } = await supabase
      .from("firm_site_sections")
      .select("id, page_id, section_type, content, display_order, is_visible")
      .in("page_id", pageIds)
      .order("display_order", { ascending: true });
    if (error) throw new Error(`Couldn't read sections: ${error.message}`);
    sections = data ?? [];
  }

  return {
    version: 1,
    site: { id: site.id, firm_name: site.firm_name, subdomain: site.subdomain, brand: site.brand },
    pages: (pages ?? []).map((p) => ({
      ...p,
      sections: sections
        .filter((s) => s.page_id === p.id)
        .map(({ page_id: _pageId, ...rest }) => rest),
    })),
  };
}

/**
 * Publishes the site in one action. Returns the updated site row and the new
 * publish-history row. Throws with a readable message on any failure.
 */
export async function publishSite(
  site: FirmSite,
  userId: string,
  note: string,
): Promise<{ site: FirmSite; publish: FirmSitePublish }> {
  const snapshot = await fetchSiteTree(site);

  const { data: publish, error: publishError } = await supabase
    .from("firm_site_publishes")
    .insert({
      site_id: site.id,
      published_by: userId,
      snapshot: snapshot as unknown as Json,
      note: note.trim() || null,
    })
    .select()
    .single();
  if (publishError || !publish) {
    throw new Error(`Couldn't save the publish snapshot: ${publishError?.message ?? "no row returned"}`);
  }

  const { data: updated, error: siteError } = await supabase
    .from("firm_sites")
    .update({ is_published: true, published_at: publish.created_at })
    .eq("id", site.id)
    .select()
    .single();
  if (siteError || !updated) {
    throw new Error(`Snapshot saved, but the site couldn't be switched live: ${siteError?.message ?? "no row returned"}`);
  }

  return { site: updated, publish };
}

/** Takes the site offline. Publish history and content are kept. */
export async function unpublishSite(site: FirmSite): Promise<FirmSite> {
  const { data, error } = await supabase
    .from("firm_sites")
    .update({ is_published: false })
    .eq("id", site.id)
    .select()
    .single();
  if (error || !data) throw new Error(`Couldn't unpublish: ${error?.message ?? "no row returned"}`);
  return data;
}

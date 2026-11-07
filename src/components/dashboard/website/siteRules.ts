/**
 * siteRules.ts — Pure validation + shaping helpers for the Website Manager.
 *
 * Everything in here is framework-free (no React, no Supabase) so the rules can
 * be unit-tested in isolation and shared by every Website Manager component.
 *
 * The regexes below intentionally MIRROR the CHECK constraints on the live
 * database (migration 20261107000000_firm_site_cms.sql). The database is the
 * real enforcer; these client-side copies exist only so the firm sees a clear
 * message before a request is ever sent. If the DB constraint changes, change
 * these to match — never loosen them independently.
 */

/* -------------------------------------------------------------------------- */
/* Subdomains                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mirrors firm_sites_subdomain_check:
 *   ^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])$
 * → lowercase letters, numbers and hyphens, 3–50 chars, no leading/trailing hyphen.
 */
export const SUBDOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])$/;

/**
 * Returns a human-readable error for an invalid subdomain, or null when valid.
 * Checks are ordered so the firm sees the most specific problem first.
 */
export function validateSubdomain(value: string): string | null {
  if (!value) return "Enter a subdomain.";
  if (value.length < 3) return "Subdomain must be at least 3 characters.";
  if (value.length > 50) return "Subdomain must be 50 characters or fewer.";
  if (/[^a-z0-9-]/.test(value)) return "Use only lowercase letters, numbers and hyphens.";
  if (value.startsWith("-") || value.endsWith("-")) return "Subdomain can't start or end with a hyphen.";
  if (!SUBDOMAIN_PATTERN.test(value)) return "That subdomain isn't valid.";
  return null;
}

/**
 * Suggests a subdomain from a firm name, e.g. "Smith & Jones, LLP" → "smith-jones-llp".
 * The result is only a suggestion — it still goes through validateSubdomain().
 */
export function suggestSubdomain(firmName: string): string {
  return firmName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}

/**
 * The zone published firm sites are served from, as `<subdomain>.<this>`.
 *
 * Declared once here and imported everywhere it is shown, so changing the zone
 * is a one-line edit rather than a hunt through the UI. It MUST stay in step
 * with SITE_BASE_DOMAIN in the firm-site-renderer Worker
 * (bizooma/firm-site-renderer, wrangler.toml), which is what actually resolves
 * a hostname to a site — a mismatch means the editor advertises a URL that
 * serves nothing.
 */
export const SITE_BASE_DOMAIN = "sites.amicusedge.com";

/** Public URL a published firm site is served from. */
export function liveSiteUrl(subdomain: string): string {
  return `https://${subdomain}.${SITE_BASE_DOMAIN}`;
}

/* -------------------------------------------------------------------------- */
/* Page slugs                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Mirrors firm_site_pages_slug_check:
 *   ^[a-z0-9]([a-z0-9/-]{0,98}[a-z0-9])?$
 * → lowercase letters, numbers, hyphens and forward slashes, 1–100 chars,
 *   must start and end with a letter or number.
 */
export const SLUG_PATTERN = /^[a-z0-9]([a-z0-9/-]{0,98}[a-z0-9])?$/;

/** Returns a human-readable error for an invalid page slug, or null when valid. */
export function validateSlug(value: string): string | null {
  if (!value) return "Enter a page address.";
  if (value.length > 100) return "Page address must be 100 characters or fewer.";
  if (/[^a-z0-9/-]/.test(value)) return "Use only lowercase letters, numbers, hyphens and forward slashes.";
  if (!/^[a-z0-9]/.test(value) || !/[a-z0-9]$/.test(value)) {
    return "Page address must start and end with a letter or number.";
  }
  if (!SLUG_PATTERN.test(value)) return "That page address isn't valid.";
  return null;
}

/** Suggests a slug from a page title, e.g. "Car Accident Lawyer" → "car-accident-lawyer". */
export function suggestSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^[-/]+|[-/]+$/g, "")
    .slice(0, 100)
    .replace(/[-/]+$/g, "");
}

/* -------------------------------------------------------------------------- */
/* Ordering                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Moves the item at `index` one step up (-1) or down (+1) and returns the new
 * array. Returns the same array untouched when the move would go out of bounds.
 */
export function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * Given rows in their desired visual order, returns only the rows whose stored
 * display_order differs from their position — i.e. the minimum set of UPDATEs
 * needed. Rewriting positions (rather than swapping two values) also repairs
 * lists where several rows share the same display_order (e.g. all 0).
 */
export function orderUpdates<T extends { id: string; display_order: number }>(
  ordered: T[],
): { id: string; display_order: number }[] {
  return ordered
    .map((row, position) => ({ id: row.id, display_order: position, changed: row.display_order !== position }))
    .filter((r) => r.changed)
    .map(({ id, display_order }) => ({ id, display_order }));
}

/* -------------------------------------------------------------------------- */
/* Postgres error helpers                                                     */
/* -------------------------------------------------------------------------- */

/** Postgres unique_violation SQLSTATE — returned by PostgREST as `code: "23505"`. */
export function isUniqueViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23505";
}

/** Postgres check_violation SQLSTATE. */
export function isCheckViolation(error: { code?: string } | null | undefined): boolean {
  return error?.code === "23514";
}

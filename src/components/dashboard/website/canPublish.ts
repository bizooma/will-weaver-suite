/**
 * canPublish.ts — Single source of truth for "may this firm publish its site?"
 *
 * Today the website builder and publishing are free for every account, so this
 * always returns true. Hosting entitlement will be wired in HERE later — every
 * Publish button in the Website Manager calls this function, so changing the
 * rule in this one place changes it everywhere.
 *
 * Do NOT gate on role or subscription tier anywhere else.
 */
import type { FirmSite } from "./types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function canPublish(site: FirmSite): boolean {
  return true;
}

/**
 * Generate a cryptographically random, unguessable slug for shared drafts.
 * Since knowing the slug authorizes access to the draft via the
 * get_will_draft_by_slug RPC, it MUST be high-entropy (not Math.random).
 * 16 random bytes = 128 bits of entropy, hex-encoded.
 */
export function generateSlug() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `wd-${hex}`;
}

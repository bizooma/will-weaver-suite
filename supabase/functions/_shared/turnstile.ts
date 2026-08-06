// Cloudflare Turnstile server-side verification.
//
// Every public form that renders a Turnstile widget must send its token to the
// backend, and the backend must call Cloudflare's canonical siteverify endpoint
// before acting on the request. The secret is read from the TURNSTILE_SECRET
// environment variable and is never present in source.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  success: boolean;
  /** Error codes returned by Cloudflare (useful for logs, not for users). */
  errorCodes?: string[];
}

/**
 * Verify a Turnstile token.
 *
 * @param token    the `cf-turnstile-response` token from the browser
 * @param remoteip the end-user's IP (first entry of x-forwarded-for)
 */
export async function verifyTurnstile(
  token: string | undefined | null,
  remoteip?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = Deno.env.get("TURNSTILE_SECRET");
  if (!secret) {
    console.error("TURNSTILE_SECRET is not configured");
    return { success: false, errorCodes: ["missing-secret"] };
  }
  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response: token,
        ...(remoteip ? { remoteip } : {}),
      }),
    });
    const data = await res.json();
    // Only `success === true` may let the request through.
    if (data?.success === true) return { success: true };
    console.warn("Turnstile verification failed", data?.["error-codes"]);
    return { success: false, errorCodes: data?.["error-codes"] ?? [] };
  } catch (err) {
    console.error("Turnstile siteverify request error", err);
    return { success: false, errorCodes: ["internal-error"] };
  }
}

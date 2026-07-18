// Shared security helpers for public edge functions.
//
// Consolidates: CORS headers, body-size caps, auth extraction, client IP
// extraction, and a lightweight in-memory rate limiter. Every public
// AI/voice edge function should use these to prevent runaway API-cost abuse
// on the OpenAI / ElevenLabs bills.
//
// Rate-limit note: the limiter is in-memory per Deno isolate. It stops
// casual scripted abuse (the realistic threat here) but does NOT stop a
// distributed attacker; Supabase spins multiple isolates per function under
// load. A durable limiter would require a `rate_limits` table. Documented
// as a tradeoff in .lovable/plan.md.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

/** Standard CORS headers used by every public edge function. */
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Build a JSON Response with CORS headers already applied. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Extract the caller IP from the request. Supabase edge functions sit
 * behind a proxy, so the real client IP is in x-forwarded-for (first entry).
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

/**
 * Enforce a maximum body size using the Content-Length header. Returns a
 * 413 response if the header is missing (unbounded) or over the cap.
 * Cheap and effective; avoids buffering giant bodies just to reject them.
 */
export function enforceBodySize(req: Request, maxBytes: number): Response | null {
  const len = req.headers.get("content-length");
  if (!len) {
    return jsonResponse({ error: "Content-Length required" }, 411);
  }
  const n = Number(len);
  if (!Number.isFinite(n) || n < 0 || n > maxBytes) {
    return jsonResponse({ error: `Payload too large (max ${maxBytes} bytes)` }, 413);
  }
  return null;
}

/**
 * Require a valid Supabase JWT on the request. Returns { userId } on
 * success or a 401 Response ready to return. Uses the anon client + user
 * JWT (never the service role) so downstream RLS is honored where used.
 */
export async function requireAuth(
  req: Request,
): Promise<{ userId: string; email: string | null } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice("Bearer ".length);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  return { userId: data.user.id, email: data.user.email ?? null };
}

/** Check whether a request Origin is on an allowlist (case-insensitive host). */
export function originAllowed(req: Request, allowlist: string[]): boolean {
  if (!allowlist || allowlist.length === 0) return true; // no list = allow all
  const origin = req.headers.get("origin") || "";
  if (!origin) return false;
  let host = "";
  try {
    host = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }
  return allowlist.some((entry) => {
    const e = entry.trim().toLowerCase();
    if (!e) return false;
    // Support "*.example.com" wildcards
    if (e.startsWith("*.")) {
      return host === e.slice(2) || host.endsWith(e.slice(1));
    }
    return host === e;
  });
}

// ---------- In-memory token-bucket rate limiter ----------
// Keyed by an arbitrary string (userId, ip, ip:chatbotId). Uses fixed
// window counting for simplicity — good enough for cost-abuse protection.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
  /** Bucket key — pass userId when authenticated, otherwise ip. */
  key: string;
}

/** Returns null when the caller is within budget, or a 429 Response. */
export function checkRateLimit(opts: RateLimitOptions): Response | null {
  const now = Date.now();
  const windowMs = opts.windowSeconds * 1000;
  const b = buckets.get(opts.key);
  if (!b || b.resetAt < now) {
    buckets.set(opts.key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (b.count >= opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please retry later." }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      },
    );
  }
  b.count += 1;
  return null;
}

/**
 * Combined guard for authenticated AI endpoints:
 *   1. CORS preflight short-circuit (caller should still handle OPTIONS itself)
 *   2. Body-size cap (Content-Length)
 *   3. Auth required
 *   4. Rate limit per user
 * Returns either { userId } or a Response to return immediately.
 */
export async function guardAuthed(
  req: Request,
  opts: { maxBytes: number; limit?: number; windowSeconds?: number },
): Promise<{ userId: string } | Response> {
  const sizeErr = enforceBodySize(req, opts.maxBytes);
  if (sizeErr) return sizeErr;
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const rl = checkRateLimit({
    key: `user:${auth.userId}`,
    limit: opts.limit ?? 20,
    windowSeconds: opts.windowSeconds ?? 60,
  });
  if (rl) return rl;
  return { userId: auth.userId };
}

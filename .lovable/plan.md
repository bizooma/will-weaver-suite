## Security hardening plan

Grouped by concern so I can ship it in one pass. Each item lists the exact files touched and the mitigation.

### 1. Auth + rate limit + size caps on AI/voice endpoints

New shared helpers in `supabase/functions/_shared/`:
- `rate-limit.ts` — in-memory token bucket keyed by `userId || ip`, 20 req/min default per key, per-function overrides. In-memory is per-isolate but effective against script abuse; the alternative (DB table) needs its own migration and adds latency. Flag this tradeoff to the user.
- `security.ts` — helpers: `getClientIp(req)`, `enforceBodySize(req, maxBytes)`, `requireAuth(req)` returning `{ userId } | Response`, `originAllowed(req, list)`.

Apply to each function:

| Function | Auth | Rate limit key | Body cap | Extra |
|---|---|---|---|---|
| ai-copilot | required | userId | 8 KB | — |
| ai-review-will | required | userId | 32 KB | — |
| ai-generate-clause | required | userId | 8 KB | — |
| voice-to-text | required | userId | 10 MB | audio size cap |
| text-to-voice | required | userId | 4 KB text | — |
| voice-to-structured-data | required | userId | 16 KB | — |
| eleven-signed-url | required | userId | n/a | — |
| chatbot-response | public but gated | ip + chatbotId | 4 KB | origin allowlist from `chatbots.configuration.allowedOrigins` (fallback: any origin if list empty, log a warning) |

### 2. SSRF guard for URL-fetching functions

New `_shared/url-guard.ts` with `assertSafeUrl(urlString)`:
- Only `http:` / `https:`
- Reject if host resolves to any of: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16` (link-local + AWS metadata), `::1`, `fc00::/7`, `fe80::/10`, `0.0.0.0`, `localhost`, `metadata.google.internal`
- Uses `Deno.resolveDns` for A/AAAA lookup before fetch.

Wire into `process-training-url` and `analyze-seo` before every outbound `fetch`.

### 3. IDOR fix on training writes

In `process-training-url` and `process-training-document`:
- Require caller JWT (already partially there), extract `userId` via `getClaims`.
- Before any service-role write to `training_sources`, `SELECT user_id FROM training_sources WHERE id = trainingSourceId` and 403 if `user_id !== userId` (or caller is not admin).

### 4. create-checkout allowlist

- Hardcode a `PRICE_ALLOWLIST: Record<string, { coupons?: string[] }>` map of the 4 subscription tier price IDs currently in code.
- Reject unknown `priceId` with 400.
- Reject `couponId` unless it appears in the price's allowed coupons list (Jax bar coupon tied to its price, etc.).

### 5. qr-backfill-geo

Add admin check via `has_role(auth.uid(), 'admin')` at the top; 403 otherwise. Keep the function (user said "or remove"; keeping is safer if they still need it).

### 6. Resend sending domain

Cannot verify a domain from code — this is a DNS + Resend dashboard task. I'll:
- Change `submit-contact-form` `from` to a placeholder `Amicus Edge <noreply@amicusedge.com>` behind a `MAIL_FROM` env var (defaults to current onboarding address if unset, so nothing breaks).
- Tell the user in chat exactly what DNS records to add and where in the Resend dashboard to verify — no code can do this for them.

### 7. Consent-gated internal analytics

- Find internal analytics/logger calls (likely `src/lib/analytics.ts` or similar — need to grep).
- Read consent from the same storage the cookie banner writes to.
- Wrap all `logEvent`/tracker calls in a `if (hasAnalyticsConsent())` guard, or short-circuit inside the logger itself (preferred — single choke point).

### Rate-limiting caveat

Per platform guidance, there is no standard backend rate-limit primitive; the in-memory limiter above is ad-hoc and only slows down casual abuse (a determined attacker across many isolates bypasses it). A durable limiter needs a `rate_limits` table + upsert-on-call. **Confirm you're OK with the in-memory approach**, or I'll add the DB-backed version (one extra migration, ~5ms per call).

### Out of scope (not in the request)

- Rewriting existing auth flows
- Backfilling logs
- Any UI copy changes

Approve and I'll execute in this order: shared helpers → per-function edits → checkout allowlist → SSRF → training IDOR → qr admin gate → Resend env var swap → consent gate. One migration only if you pick the DB-backed limiter.
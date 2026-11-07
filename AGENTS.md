
- SEO canonicals/og:url are pinned to https://amicusedge.com (SEOHead SITE_ORIGIN), never window.location.origin — preview domains must not self-canonicalize.
- public/sitemap.xml is the prerender route list (scripts/prerender.mjs); add a route there to both index and prerender it.
- Website Manager (src/components/dashboard/website/): section types and content keys in types.ts/sectionContent.ts are a contract with the public site renderer — change both together; publish eligibility lives only in canPublish.ts. Why: the renderer reads exact jsonb keys and hosting entitlement will be wired in one place.
- Pure-logic tests live in tests/*.test.ts and run with `bun test ./tests/<file>` (Bun's built-in runner, no npm test package). Why: src/ is type-checked without Bun types.

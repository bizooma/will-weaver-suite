
- SEO canonicals/og:url are pinned to https://amicusedge.com (SEOHead SITE_ORIGIN), never window.location.origin — preview domains must not self-canonicalize.
- public/sitemap.xml is the prerender route list (scripts/prerender.mjs); add a route there to both index and prerender it.



## Remove PageSpeed from AIO Analyzer

The `pageSpeed` field exists only in the edge function (`supabase/functions/analyze-seo/index.ts`). The frontend doesn't display it, so changes are backend-only.

### Changes

**`supabase/functions/analyze-seo/index.ts`**:
1. Remove `pageSpeed: number` from the `TechnicalSEO` interface (line 25)
2. Remove `pageSpeed: 75` from the `analyzeTechnicalSEO` function (line 165)
3. Remove the "Optimize page loading speed and Core Web Vitals" recommendation (line 543)

Then redeploy the `analyze-seo` edge function.


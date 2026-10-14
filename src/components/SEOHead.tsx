/**
 * SEOHead — Reusable component that renders all Open Graph, Twitter Card,
 * canonical, and JSON-LD structured-data meta tags via react-helmet-async.
 *
 * Usage:
 *   <SEOHead
 *     title="Page Title | Amicus Edge"
 *     description="Max 160-char description."
 *     path="/about"
 *   />
 *
 * Every page should use this component instead of manually writing <Helmet>.
 */

import { Helmet } from "react-helmet-async";

/** Props accepted by the SEOHead component */
export interface SEOHeadProps {
  /** Page title — keep under 60 characters */
  title: string;
  /** Meta description — keep under 160 characters */
  description: string;
  /** Route path starting with "/" (e.g. "/about"). Used for canonical & og:url */
  path?: string;
  /** OG image path relative to origin. Defaults to /og-default.png */
  image?: string;
  /** Alt text for the OG image */
  imageAlt?: string;
  /** og:type — defaults to "website" */
  type?: "website" | "article";
  /** Optional keywords for the meta keywords tag */
  keywords?: string[];
  /** Optional JSON-LD structured data object */
  structuredData?: Record<string, unknown>;
  /**
   * When true, emits <meta name="robots" content="noindex, nofollow">.
   * Used for pages that stay reachable by direct link but must not be indexed
   * (e.g. the voice feature pages while the feature is unfinished).
   */
  noindex?: boolean;
}

/** Site-wide brand constants used in every social card */
const BRAND = {
  siteName: "Amicus Edge",
  twitterSite: "@AmicusEdge",
  locale: "en_US",
  defaultImage: "/og-default.png",
  defaultImageAlt: "Amicus Edge — AI-Powered Legal Tech for Law Firms",
  imageWidth: "1200",
  imageHeight: "630",
} as const;

/** Production origin used for every absolute SEO URL (never the preview host). */
export const SITE_ORIGIN = "https://amicusedge.com";

const SEOHead = ({
  title,
  description,
  path = "/",
  image,
  imageAlt,
  type = "website",
  keywords,
  structuredData,
  noindex = false,
}: SEOHeadProps) => {
  // Canonical/og:url/og:image are pinned to the production domain on purpose.
  // Deriving them from window.location.origin would let the *.lovable.app
  // preview copy declare ITSELF canonical and split ranking signals.
  const origin = SITE_ORIGIN;
  const canonicalUrl = `${origin}${path}`;
  const imageUrl = `${origin}${image || BRAND.defaultImage}`;
  const altText = imageAlt || BRAND.defaultImageAlt;

  return (
    <Helmet>
      {/* ── Basic HTML meta ─────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* ── Open Graph ──────────────────────────────────────── */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content={BRAND.imageWidth} />
      <meta property="og:image:height" content={BRAND.imageHeight} />
      <meta property="og:image:alt" content={altText} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={BRAND.siteName} />
      <meta property="og:locale" content={BRAND.locale} />

      {/* ── Twitter Card ────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={altText} />
      <meta name="twitter:site" content={BRAND.twitterSite} />

      {/* ── JSON-LD structured data (optional) ──────────────── */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

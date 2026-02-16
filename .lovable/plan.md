

# Custom Twitter Card and Open Graph for Social Sharing

## What This Does
Creates branded, law-firm-targeted social media preview cards that appear when someone shares any page from your site on Twitter/X, Facebook, LinkedIn, or other platforms. This ensures every shared link displays your brand, a compelling description, and a professional image -- driving more clicks from social media.

## Changes

### 1. Create a dedicated OG image component
Create `public/og-default.png` placeholder and update `index.html` with fallback OG/Twitter meta tags so crawlers that don't execute JavaScript still see proper social cards.

### 2. Update `src/lib/seo.ts`
- Update the `generateMetaTags` function with law-firm-specific defaults
- Add `twitter:creator` support
- Add `og:locale` tag
- Set proper image dimensions (`og:image:width`, `og:image:height`)
- Update Twitter site handle to match your brand
- Add `og:image:alt` for accessibility

### 3. Update `index.html` fallback meta tags
- Replace generic Lovable OG image with your branded image (`/lovable-uploads/cc4784bf-4dbf-4471-baf8-5b973bd98614.png` or a new dedicated OG image)
- Update `og:title`, `og:description`, `twitter:site` to reflect Amicus Edge branding
- Add `og:image:width` and `og:image:height` (recommended: 1200x630)
- Add `og:locale` set to `en_US`

### 4. Update per-page SEO configs
Add custom OG data to each page that has a `<Helmet>`:
- **Index**: "AI-Powered Legal Tech for Law Firms | Amicus Edge"
- **About**: "About Amicus Edge | Legal Technology Built for Law Firms"
- **Alexa**: "Custom Alexa Skills for Law Firms | Amicus Edge"
- **Blog**: "Legal Marketing Resources for Law Firms | Amicus Edge"
- **Contact, WillTrustMarketing, MobileApp, VideoChatbots**, etc. -- each gets a tailored title/description

### 5. Create a reusable `<SEOHead>` component
A new `src/components/SEOHead.tsx` component that standardizes all OG/Twitter tags across pages, reducing boilerplate. Each page passes a simple config object and gets the full set of meta tags including:
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale`
- `og:image:width`, `og:image:height`, `og:image:alt`
- `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`
- Canonical URL
- JSON-LD structured data

## Technical Details

**Files to create:**
- `src/components/SEOHead.tsx` -- reusable SEO meta tag component

**Files to modify:**
- `src/lib/seo.ts` -- add image dimension tags, locale, alt text, update branding
- `index.html` -- update fallback meta tags for non-JS crawlers
- `src/pages/Index.tsx` -- use new `SEOHead` component
- `src/pages/About.tsx` -- use new `SEOHead` component
- `src/pages/Alexa.tsx` -- use new `SEOHead` component
- `src/pages/Blog.tsx` -- use new `SEOHead` component
- `src/pages/Contact.tsx` -- use new `SEOHead` component
- Other page files as needed

**Key specs:**
- OG image dimensions: 1200x630px (Facebook/LinkedIn optimal)
- Twitter card type: `summary_large_image`
- All descriptions capped at 160 characters for optimal display
- All titles capped at 60 characters where possible


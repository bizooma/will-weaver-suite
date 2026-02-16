// SEO optimization utilities for Amicus Edge — a legal-tech SaaS platform
import { ENV_CONFIG } from './config';

/** Configuration object for per-page SEO meta tags */
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/** Brand constants shared across all social cards */
const BRAND = {
  siteName: 'Amicus Edge',
  twitterSite: '@AmicusEdge',
  locale: 'en_US',
  defaultOgImage: '/og-default.png',
  defaultImageAlt: 'Amicus Edge — AI-Powered Legal Tech for Law Firms',
  imageWidth: '1200',
  imageHeight: '630',
} as const;

/**
 * Generates a flat object of meta-tag key/value pairs for a given page.
 * Includes Open Graph, Twitter Card, image dimensions, locale, and alt text.
 */
export const generateMetaTags = (config: SEOConfig) => {
  const baseUrl = ENV_CONFIG.app.url;
  const fullUrl = config.url ? `${baseUrl}${config.url}` : baseUrl;
  const image = config.image
    ? `${baseUrl}${config.image}`
    : `${baseUrl}${BRAND.defaultOgImage}`;
  const imageAlt = config.imageAlt || BRAND.defaultImageAlt;

  return {
    // Basic meta tags
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', '),

    // Open Graph tags
    'og:title': config.title,
    'og:description': config.description,
    'og:image': image,
    'og:image:width': BRAND.imageWidth,
    'og:image:height': BRAND.imageHeight,
    'og:image:alt': imageAlt,
    'og:url': fullUrl,
    'og:type': config.type || 'website',
    'og:site_name': BRAND.siteName,
    'og:locale': BRAND.locale,

    // Twitter Card tags
    'twitter:card': 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': image,
    'twitter:image:alt': imageAlt,
    'twitter:site': BRAND.twitterSite,

    // Article specific tags
    ...(config.type === 'article' && {
      'article:author': config.author,
      'article:published_time': config.publishedTime,
      'article:modified_time': config.modifiedTime,
    }),

    // Canonical URL
    canonical: fullUrl,
  };
};

export const generateStructuredData = (config: SEOConfig) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Amicus Edge',
    description: 'AI-powered legal marketing platform built for law firms.',
    url: ENV_CONFIG.app.url,
    applicationCategory: 'LegalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Amicus Edge',
      url: ENV_CONFIG.app.url,
    },
  };

  // Add page-specific structured data
  if (config.type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: config.title,
      description: config.description,
      image: config.image,
      author: {
        '@type': 'Person',
        name: config.author || 'Legal AI Assistant',
      },
      publisher: {
        '@type': 'Organization',
        name: ENV_CONFIG.app.name,
        logo: {
          '@type': 'ImageObject',
          url: `${ENV_CONFIG.app.url}/lovable-uploads/cc4784bf-4dbf-4471-baf8-5b973bd98614.png`,
        },
      },
      datePublished: config.publishedTime,
      dateModified: config.modifiedTime,
    };
  }

  return baseSchema;
};

// Page performance scoring
export const calculatePageScore = () => {
  const checks = {
    // SEO checks
    hasTitle: !!document.title,
    hasDescription: !!document.querySelector('meta[name="description"]'),
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
    
    // Performance checks
    hasLazyLoading: document.querySelectorAll('img[loading="lazy"]').length > 0,
    hasOptimizedImages: Array.from(document.images).every(img => 
      img.src.includes('.webp') || img.src.includes('.avif') || img.naturalWidth <= 1920
    ),
    
    // Accessibility checks
    hasAltTexts: Array.from(document.images).every(img => img.alt),
    hasHeadingStructure: document.querySelectorAll('h1').length === 1,
    
    // Security checks
    hasHTTPS: window.location.protocol === 'https:',
  };

  const totalChecks = Object.keys(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  return {
    score: Math.round((passedChecks / totalChecks) * 100),
    checks,
    recommendations: generateRecommendations(checks),
  };
};

const generateRecommendations = (checks: Record<string, boolean>) => {
  const recommendations: string[] = [];
  
  if (!checks.hasTitle) recommendations.push('Add a descriptive page title');
  if (!checks.hasDescription) recommendations.push('Add a meta description');
  if (!checks.hasCanonical) recommendations.push('Add canonical URL');
  if (!checks.hasStructuredData) recommendations.push('Add structured data');
  if (!checks.hasLazyLoading) recommendations.push('Implement lazy loading for images');
  if (!checks.hasOptimizedImages) recommendations.push('Optimize image sizes and formats');
  if (!checks.hasAltTexts) recommendations.push('Add alt text to all images');
  if (!checks.hasHeadingStructure) recommendations.push('Ensure proper heading structure (single H1)');
  if (!checks.hasHTTPS) recommendations.push('Ensure HTTPS is enabled');
  
  return recommendations;
};

// Sitemap generation utility
export const generateSitemap = () => {
  const routes = [
    { path: '/', priority: 1.0, changefreq: 'weekly' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    { path: '/will-creator', priority: 0.9, changefreq: 'weekly' },
    { path: '/alexa', priority: 0.7, changefreq: 'monthly' },
    { path: '/mobile-app', priority: 0.7, changefreq: 'monthly' },
    { path: '/blog', priority: 0.6, changefreq: 'weekly' },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${ENV_CONFIG.app.url}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Robots.txt generation
export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Disallow: /drafts/
Disallow: /auth

Sitemap: ${ENV_CONFIG.app.url}/sitemap.xml

# Security
User-agent: *
Crawl-delay: 1`;
};
/**
 * types.ts — Shared types and the section content CONTRACT for the Website Manager.
 *
 * The eight section types and their content keys below are a contract with the
 * public site renderer. Do not add, rename, or drop keys here without changing
 * the renderer in the same release — the renderer reads these exact keys out of
 * firm_site_sections.content (jsonb).
 *
 * The database also restricts section_type to exactly these eight values
 * (firm_site_sections_section_type_check).
 */
import type { Tables } from "@/integrations/supabase/types";

/* -------------------------------------------------------------------------- */
/* Row types (straight from the generated Supabase types)                     */
/* -------------------------------------------------------------------------- */

export type FirmSite = Tables<"firm_sites">;
export type FirmSitePage = Tables<"firm_site_pages">;
export type FirmSiteSection = Tables<"firm_site_sections">;
export type FirmSitePublish = Tables<"firm_site_publishes">;
/** Contact-form enquiry written by the public renderer (service role); read-only to the client except is_read / delete. */
export type FirmSiteLead = Tables<"firm_site_leads">;

/* -------------------------------------------------------------------------- */
/* Section content contract                                                   */
/* -------------------------------------------------------------------------- */

export interface HeroContent {
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_href: string;
  image_url: string;
}

export interface AboutContent {
  heading: string;
  body: string;
  image_url: string;
}

export interface PracticeAreaItem {
  title: string;
  description: string;
}
export interface PracticeAreasContent {
  heading: string;
  items: PracticeAreaItem[];
}

export interface AttorneyBioContent {
  name: string;
  title: string;
  bio: string;
  photo_url: string;
  bar_admissions: string[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  /** true = placeholder text; the renderer visibly marks sample quotes. */
  is_sample: boolean;
}
export interface TestimonialsContent {
  heading: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqContent {
  heading: string;
  items: FaqItem[];
}

export interface ContactContent {
  heading: string;
  phone: string;
  email: string;
  address: string;
  show_form: boolean;
}

export interface CtaContent {
  headline: string;
  body: string;
  cta_label: string;
  cta_href: string;
}

/** Maps each section_type to its content shape. */
export interface SectionContentMap {
  hero: HeroContent;
  about: AboutContent;
  practice_areas: PracticeAreasContent;
  attorney_bio: AttorneyBioContent;
  testimonials: TestimonialsContent;
  faq: FaqContent;
  contact: ContactContent;
  cta: CtaContent;
}

export type SectionType = keyof SectionContentMap;

/** Display order + labels for the "Add section" picker. */
export const SECTION_TYPES: { type: SectionType; label: string; description: string }[] = [
  { type: "hero", label: "Hero", description: "Top-of-page headline and call to action" },
  { type: "about", label: "About", description: "Who the firm is and how it helps clients" },
  { type: "practice_areas", label: "Practice areas", description: "The kinds of cases the firm handles" },
  { type: "attorney_bio", label: "Attorney bio", description: "One attorney's background and bar admissions" },
  { type: "testimonials", label: "Testimonials", description: "Client reviews — must be real before publishing" },
  { type: "faq", label: "FAQ", description: "Questions prospective clients ask" },
  { type: "contact", label: "Contact", description: "Phone, email, office address and inquiry form" },
  { type: "cta", label: "Call to action", description: "A closing prompt to book a consultation" },
];

export function sectionLabel(type: string): string {
  return SECTION_TYPES.find((s) => s.type === type)?.label ?? type;
}

export function isSectionType(value: string): value is SectionType {
  return SECTION_TYPES.some((s) => s.type === value);
}

/* -------------------------------------------------------------------------- */
/* Brand jsonb on firm_sites                                                  */
/* -------------------------------------------------------------------------- */

export interface BrandSettings {
  primary: string;
  secondary: string;
  accent: string;
  heading_font: string;
  body_font: string;
  /** CSS length used for corner rounding, e.g. "8px". */
  radius: string;
  logo_url: string;
}

export const DEFAULT_BRAND: BrandSettings = {
  primary: "#1f2f52",
  secondary: "#f4f1ea",
  accent: "#8f2340",
  heading_font: "Georgia",
  body_font: "Helvetica",
  radius: "8px",
  logo_url: "",
};

/** Fills any missing brand keys with defaults and drops anything unknown. */
export function normalizeBrand(raw: unknown): BrandSettings {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (k: keyof BrandSettings) => (typeof src[k] === "string" ? (src[k] as string) : DEFAULT_BRAND[k]);
  return {
    primary: str("primary"),
    secondary: str("secondary"),
    accent: str("accent"),
    heading_font: str("heading_font"),
    body_font: str("body_font"),
    radius: str("radius"),
    logo_url: str("logo_url"),
  };
}

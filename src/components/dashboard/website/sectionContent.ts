/**
 * sectionContent.ts — Default content and normalisation for the eight section types.
 *
 * `defaultContent(type)` is what a brand-new section starts with.
 * `normalizeContent(type, raw)` turns whatever is stored in the jsonb column into
 * the exact contract shape: every contract key present with the right type, and
 * any unknown key dropped. Editors always work on normalised content, so what we
 * write back to the database is always exactly the contract.
 *
 * Defaults are deliberately EMPTY rather than invented copy: a law firm site must
 * not ship made-up facts, results or endorsements. Helpful example wording lives
 * in input placeholders instead, which are never saved.
 */
import type {
  SectionContentMap,
  SectionType,
  TestimonialItem,
  PracticeAreaItem,
  FaqItem,
} from "./types";

/* ---------------------------- small coercers ----------------------------- */

const asString = (v: unknown): string => (typeof v === "string" ? v : "");
const asBool = (v: unknown, fallback: boolean): boolean => (typeof v === "boolean" ? v : fallback);
const asObjects = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x) => x && typeof x === "object") as Record<string, unknown>[] : [];

/* ---------------------------- new item factories ------------------------- */

export const newPracticeArea = (): PracticeAreaItem => ({ title: "", description: "" });
export const newFaqItem = (): FaqItem => ({ question: "", answer: "" });
/**
 * New testimonials ALWAYS start as samples. Clearing is_sample must be a
 * deliberate act by the firm — an unlabelled invented client endorsement on an
 * attorney's website is a bar advertising problem.
 */
export const newTestimonial = (): TestimonialItem => ({ quote: "", author: "", is_sample: true });

/* ---------------------------- defaults ----------------------------------- */

export function defaultContent<T extends SectionType>(type: T): SectionContentMap[T] {
  const defaults: SectionContentMap = {
    hero: { headline: "", subheadline: "", cta_label: "", cta_href: "", image_url: "" },
    about: { heading: "", body: "", image_url: "" },
    practice_areas: { heading: "", items: [newPracticeArea()] },
    attorney_bio: { name: "", title: "", bio: "", photo_url: "", bar_admissions: [] },
    testimonials: { heading: "", items: [newTestimonial()] },
    faq: { heading: "", items: [newFaqItem()] },
    contact: { heading: "", phone: "", email: "", address: "", show_form: true },
    cta: { headline: "", body: "", cta_label: "", cta_href: "" },
  };
  return defaults[type];
}

/* ---------------------------- normalisation ------------------------------ */

export function normalizeContent<T extends SectionType>(type: T, raw: unknown): SectionContentMap[T] {
  const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  let out: SectionContentMap[SectionType];

  switch (type) {
    case "hero":
      out = {
        headline: asString(c.headline),
        subheadline: asString(c.subheadline),
        cta_label: asString(c.cta_label),
        cta_href: asString(c.cta_href),
        image_url: asString(c.image_url),
      };
      break;
    case "about":
      out = { heading: asString(c.heading), body: asString(c.body), image_url: asString(c.image_url) };
      break;
    case "practice_areas":
      out = {
        heading: asString(c.heading),
        items: asObjects(c.items).map((i) => ({ title: asString(i.title), description: asString(i.description) })),
      };
      break;
    case "attorney_bio":
      out = {
        name: asString(c.name),
        title: asString(c.title),
        bio: asString(c.bio),
        photo_url: asString(c.photo_url),
        bar_admissions: Array.isArray(c.bar_admissions)
          ? c.bar_admissions.filter((x): x is string => typeof x === "string")
          : [],
      };
      break;
    case "testimonials":
      out = {
        heading: asString(c.heading),
        // Missing flag → treat as sample. Safer to over-label than to under-label.
        items: asObjects(c.items).map((i) => ({
          quote: asString(i.quote),
          author: asString(i.author),
          is_sample: asBool(i.is_sample, true),
        })),
      };
      break;
    case "faq":
      out = {
        heading: asString(c.heading),
        items: asObjects(c.items).map((i) => ({ question: asString(i.question), answer: asString(i.answer) })),
      };
      break;
    case "contact":
      out = {
        heading: asString(c.heading),
        phone: asString(c.phone),
        email: asString(c.email),
        address: asString(c.address),
        show_form: asBool(c.show_form, true),
      };
      break;
    case "cta":
      out = {
        headline: asString(c.headline),
        body: asString(c.body),
        cta_label: asString(c.cta_label),
        cta_href: asString(c.cta_href),
      };
      break;
    default:
      out = {} as never;
  }
  return out as SectionContentMap[T];
}

/** Count of testimonial items still flagged as sample text (used for publish warnings). */
export function countSampleTestimonials(sections: { section_type: string; content: unknown; is_visible: boolean }[]): number {
  return sections
    .filter((s) => s.section_type === "testimonials" && s.is_visible)
    .reduce((n, s) => n + normalizeContent("testimonials", s.content).items.filter((i) => i.is_sample).length, 0);
}

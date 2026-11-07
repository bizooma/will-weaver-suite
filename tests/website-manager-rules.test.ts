/**
 * Website Manager rules — run with `bun test ./tests/website-manager-rules.test.ts`.
 *
 * Lives outside src/ because it uses Bun's built-in test runner (no npm
 * package needed) and src/ is type-checked without Bun's types.
 * Each test pins one rule from the Website Manager brief.
 */
import { describe, expect, test } from "bun:test";
import { validateSubdomain, validateSlug, liveSiteUrl, orderUpdates } from "../src/components/dashboard/website/siteRules";
import { defaultContent, newTestimonial, normalizeContent } from "../src/components/dashboard/website/sectionContent";
import { canPublish } from "../src/components/dashboard/website/canPublish";

describe("subdomain rule (3–50, lowercase letters/numbers/hyphens, no edge hyphen)", () => {
  test("accepts a valid subdomain", () => expect(validateSubdomain("smith-jones-law")).toBeNull());
  test("rejects 2 characters", () => expect(validateSubdomain("ab")).not.toBeNull());
  test("accepts exactly 3 characters", () => expect(validateSubdomain("abc")).toBeNull());
  test("accepts exactly 50 characters", () => expect(validateSubdomain("a".repeat(50))).toBeNull());
  test("rejects 51 characters", () => expect(validateSubdomain("a".repeat(51))).not.toBeNull());
  test("rejects uppercase", () => expect(validateSubdomain("SmithLaw")).not.toBeNull());
  test("rejects a leading hyphen", () => expect(validateSubdomain("-smith")).not.toBeNull());
  test("rejects a trailing hyphen", () => expect(validateSubdomain("smith-")).not.toBeNull());
  test("rejects underscores and dots", () => {
    expect(validateSubdomain("smith_law")).not.toBeNull();
    expect(validateSubdomain("smith.law")).not.toBeNull();
  });
});

describe("page slug rule (lowercase letters, numbers, hyphens, forward slashes)", () => {
  test("accepts nested slugs", () => expect(validateSlug("practice-areas/car-accidents")).toBeNull());
  test("rejects spaces", () => expect(validateSlug("car accidents")).not.toBeNull());
  test("rejects uppercase", () => expect(validateSlug("Home")).not.toBeNull());
  test("rejects a leading slash", () => expect(validateSlug("/home")).not.toBeNull());
});

describe("testimonials default to sample", () => {
  test("a new testimonial item has is_sample true", () => expect(newTestimonial().is_sample).toBe(true));
  test("a new testimonials section's first item has is_sample true", () =>
    expect(defaultContent("testimonials").items[0].is_sample).toBe(true));
  test("a stored item missing the flag is treated as a sample", () =>
    expect(normalizeContent("testimonials", { heading: "", items: [{ quote: "q", author: "a" }] }).items[0].is_sample).toBe(true));
});

describe("content contract", () => {
  test("unknown keys are dropped and contract keys kept", () => {
    const out = normalizeContent("cta", { headline: "h", extra: "x" });
    expect(Object.keys(out).sort()).toEqual(["body", "cta_href", "cta_label", "headline"]);
  });
});

describe("publishing", () => {
  test("canPublish returns true for now", () => expect(canPublish({} as never)).toBe(true));
  test("live URL is https://{subdomain}.sites.amicusedge.com", () =>
    expect(liveSiteUrl("smith-jones")).toBe("https://smith-jones.sites.amicusedge.com"));
});

describe("reorder writes display_order positions", () => {
  test("repairs duplicate orders", () =>
    expect(orderUpdates([{ id: "a", display_order: 0 }, { id: "b", display_order: 0 }])).toEqual([{ id: "b", display_order: 1 }]));
});

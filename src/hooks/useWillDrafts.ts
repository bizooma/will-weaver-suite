
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/utils/slug";

export type WillDraft = {
  id: string;
  slug: string;
  data: unknown;
  tone: string | null;
  step: number | null;
  created_at: string;
};

export async function createDraft(input: { data: unknown; tone?: string | null; step?: number | null }) {
  let slug = generateSlug();
  let attempt = 0;

  // Try a few times in the extremely rare case of slug collision
  while (attempt < 3) {
    const { data, error } = await supabase
      .from("will_drafts")
      .insert({ slug, data: input.data as any, tone: input.tone ?? null, step: input.step ?? null })
      .select("slug")
      .single();

    if (!error && data) {
      return data.slug as string;
    }

    // If unique violation or other error, try another slug
    slug = generateSlug();
    attempt += 1;
  }

  throw new Error("Failed to create draft. Please try again.");
}

export async function getDraftBySlug(slug: string) {
  const { data, error } = await supabase
    .from("will_drafts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data as WillDraft | null;
}

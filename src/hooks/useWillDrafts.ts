
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/utils/slug";
import { createDraftSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export type WillDraft = {
  id: string;
  slug: string;
  data: unknown;
  tone: string | null;
  step: number | null;
  user_id: string | null;
  created_at: string;
};

export async function createDraft(input: { data: unknown; tone?: string | null; step?: number | null }) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.securityEvent('Unauthorized draft creation attempt');
      throw new Error("You must be logged in to create drafts.");
    }

    // Validate input
    const validationResult = createDraftSchema.safeParse(input);
    if (!validationResult.success) {
      logger.warn('Draft creation validation failed', { 
        userId: user.id, 
        errors: validationResult.error.errors 
      });
      throw new Error("Invalid draft data provided.");
    }

    let slug = generateSlug();
    let attempt = 0;

    // Try a few times in the extremely rare case of slug collision
    while (attempt < 3) {
      const { data, error } = await supabase
        .from("will_drafts")
        .insert({ 
          slug, 
          data: validationResult.data.data as any, 
          tone: validationResult.data.tone ?? null, 
          step: validationResult.data.step ?? null,
          user_id: user.id
        })
        .select("slug")
        .single();

      if (!error && data) {
        logger.info('Draft created successfully', { userId: user.id, slug: data.slug });
        return data.slug as string;
      }

      // If unique violation or other error, try another slug
      if (error) {
        logger.warn('Draft creation attempt failed', { 
          userId: user.id, 
          attempt: attempt + 1, 
          error: error.message 
        });
      }
      
      slug = generateSlug();
      attempt += 1;
    }

    logger.error('Draft creation failed after multiple attempts', null, { userId: user.id });
    throw new Error("Failed to create draft. Please try again.");
  } catch (error) {
    logger.error('Unexpected error in createDraft', error as Error);
    throw error;
  }
}

export async function getDraftBySlug(slug: string) {
  try {
    // Validate slug format (basic sanitization)
    if (!slug || typeof slug !== 'string' || slug.length > 100) {
      logger.warn('Invalid slug provided to getDraftBySlug', { slug });
      throw new Error('Invalid draft identifier');
    }

    const { data, error } = await supabase
      .from("will_drafts")
      .select("*")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (error) {
      logger.error('Database error in getDraftBySlug', error, { slug });
      throw new Error('Failed to retrieve draft');
    }

    return data as WillDraft | null;
  } catch (error) {
    logger.error('Unexpected error in getDraftBySlug', error as Error, { slug });
    throw error;
  }
}

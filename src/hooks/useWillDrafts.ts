
import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/utils/slug";
import { createDraftSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

/**
 * Will Drafts Utility Functions
 * These functions handle CRUD operations for will drafts
 * Note: These are standalone functions, not hooks, so they cannot use demo mode
 */

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

    // Use the security-definer RPC get_will_draft_by_slug — direct SELECT on
    // will_drafts is no longer allowed to the public, so shared-link access
    // now goes through this function which returns a single row by slug.
    const { data, error } = await supabase
      .rpc("get_will_draft_by_slug", { _slug: slug.trim() })
      .maybeSingle();

    if (error) {
      logger.error('Database error in getDraftBySlug', error, { slug });
      throw new Error('Failed to retrieve draft');
    }

    return (data as WillDraft | null) ?? null;

  } catch (error) {
    logger.error('Unexpected error in getDraftBySlug', error as Error, { slug });
    throw error;
  }
}

export async function getUserDrafts() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.securityEvent('Unauthorized draft fetch attempt');
      throw new Error("You must be logged in to view drafts.");
    }

    const { data, error } = await supabase
      .from("will_drafts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error('Database error in getUserDrafts', error, { userId: user.id });
      throw new Error('Failed to retrieve drafts');
    }

    return data as WillDraft[];
  } catch (error) {
    logger.error('Unexpected error in getUserDrafts', error as Error);
    throw error;
  }
}

export async function updateDraft(id: string, input: { data: unknown; tone?: string | null; step?: number | null }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.securityEvent('Unauthorized draft update attempt');
      throw new Error("You must be logged in to update drafts.");
    }

    // Validate input
    const validationResult = createDraftSchema.safeParse(input);
    if (!validationResult.success) {
      logger.warn('Draft update validation failed', { 
        userId: user.id, 
        draftId: id,
        errors: validationResult.error.errors 
      });
      throw new Error("Invalid draft data provided.");
    }

    const { data, error } = await supabase
      .from("will_drafts")
      .update({ 
        data: validationResult.data.data as any, 
        tone: validationResult.data.tone ?? null, 
        step: validationResult.data.step ?? null
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logger.error('Database error in updateDraft', error, { userId: user.id, draftId: id });
      throw new Error('Failed to update draft');
    }

    logger.info('Draft updated successfully', { userId: user.id, draftId: id });
    return data as WillDraft;
  } catch (error) {
    logger.error('Unexpected error in updateDraft', error as Error);
    throw error;
  }
}

export async function deleteDraft(id: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.securityEvent('Unauthorized draft deletion attempt');
      throw new Error("You must be logged in to delete drafts.");
    }

    const { error } = await supabase
      .from("will_drafts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logger.error('Database error in deleteDraft', error, { userId: user.id, draftId: id });
      throw new Error('Failed to delete draft');
    }

    logger.info('Draft deleted successfully', { userId: user.id, draftId: id });
  } catch (error) {
    logger.error('Unexpected error in deleteDraft', error as Error);
    throw error;
  }
}

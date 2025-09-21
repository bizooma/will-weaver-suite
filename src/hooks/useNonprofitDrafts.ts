import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateSlug } from '@/utils/slug';
import { NonprofitDraft, NonprofitFormData } from '@/types/nonprofit';
import { nonprofitFormSchema } from '@/lib/nonprofitValidation';

export const useNonprofitDrafts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = useCallback(async (formData: NonprofitFormData): Promise<string> => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);

    try {
      // Validate the form data
      nonprofitFormSchema.parse(formData);

      const slug = generateSlug(formData.organizationInfo.legalName);
      
      const { data, error: insertError } = await supabase
        .from('nonprofit_drafts')
        .insert({
          data: formData,
          step: formData.currentStep,
          user_id: user.id,
          slug: slug,
        })
        .select('slug')
        .single();

      if (insertError) {
        console.error('Error creating nonprofit draft:', insertError);
        throw new Error('Failed to create nonprofit draft');
      }

      return data.slug;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create nonprofit draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getDraftBySlug = useCallback(async (slug: string): Promise<NonprofitDraft | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('nonprofit_drafts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return null; // No draft found
        }
        throw fetchError;
      }

      return data as NonprofitDraft;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch nonprofit draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserDrafts = useCallback(async (): Promise<NonprofitDraft[]> => {
    if (!user) return [];

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('nonprofit_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return data as NonprofitDraft[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch nonprofit drafts';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateDraft = useCallback(async (id: string, formData: NonprofitFormData): Promise<NonprofitDraft> => {
    if (!user) throw new Error('User must be authenticated');

    setLoading(true);
    setError(null);

    try {
      // Validate the form data
      nonprofitFormSchema.parse(formData);

      const { data, error: updateError } = await supabase
        .from('nonprofit_drafts')
        .update({
          data: formData,
          step: formData.currentStep,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating nonprofit draft:', updateError);
        throw new Error('Failed to update nonprofit draft');
      }

      return data as NonprofitDraft;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update nonprofit draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteDraft = useCallback(async (id: string): Promise<void> => {
    if (!user) throw new Error('User must be authenticated');

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('nonprofit_drafts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting nonprofit draft:', deleteError);
        throw new Error('Failed to delete nonprofit draft');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete nonprofit draft';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createDraft,
    getDraftBySlug,
    getUserDrafts,
    updateDraft,
    deleteDraft,
    loading,
    error,
  };
};
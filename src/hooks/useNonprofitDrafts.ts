import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateSlug } from '@/utils/slug';
import { NonprofitFormData } from '@/types/nonprofit';

// Use existing will_drafts table for now until we have better type support
export const useNonprofitDrafts = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = useCallback(async (formData: NonprofitFormData): Promise<string> => {
    if (!user) throw new Error('User must be authenticated');
    
    setLoading(true);
    setError(null);

    try {
      const slug = generateSlug();
      
      const { data, error: insertError } = await supabase
        .from('will_drafts')
        .insert({
          data: formData as any,
          step: formData.currentStep,
          user_id: user.id,
          slug: slug,
          tone: 'nonprofit-formation',
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

  return {
    createDraft,
    loading,
    error,
  };
};
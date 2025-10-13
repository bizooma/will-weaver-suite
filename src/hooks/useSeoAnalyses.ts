import { useState, useEffect } from 'react';
import { useDemoSupabase } from '@/hooks/useDemoSupabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface SeoAnalysis {
  id: string;
  url: string;
  seo_score: number | null;
  voice_seo_score: number | null;
  ai_overview_score: number | null;
  status: string;
  created_at: string;
  analysis_data?: any;
}

export function useSeoAnalyses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = useDemoSupabase();
  const [analyses, setAnalyses] = useState<SeoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async () => {
    if (!user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seo_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnalyses(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('seo_analyses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      
      toast({
        title: "Analysis Deleted",
        description: "The analysis has been removed from your history",
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete analysis",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [user]);

  return {
    analyses,
    loading,
    error,
    refetch: fetchAnalyses,
    deleteAnalysis,
  };
}
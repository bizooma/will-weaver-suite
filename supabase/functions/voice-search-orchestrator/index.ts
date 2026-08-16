import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { testId, action } = await req.json();

    if (action === 'start') {
      // Get test configuration
      const { data: test, error: testError } = await supabase
        .from('voice_search_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError) throw testError;

      // Create queries for each question and assistant combination
      const queries = [];
      for (const question of test.test_questions) {
        for (const assistant of test.selected_assistants) {
          queries.push({
            test_id: testId,
            question,
            assistant,
            status: 'pending'
          });
        }
      }

      // Insert queries
      const { error: queryError } = await supabase
        .from('voice_search_queries')
        .insert(queries);

      if (queryError) throw queryError;

      // Update test status
      await supabase
        .from('voice_search_tests')
        .update({ status: 'running' })
        .eq('id', testId);

      // Start processing queries asynchronously
      const { data: createdQueries } = await supabase
        .from('voice_search_queries')
        .select('*')
        .eq('test_id', testId)
        .eq('status', 'pending');

      /**
       * No provider analyzers exist anymore. The Siri/Alexa simulators were removed
       * (no API can query those assistants) and the Google/Bing analyzers are gone
       * until a paid SERP data provider is wired up. Until then every query is
       * marked 'unavailable' and no result rows are ever written.
       */
      if (createdQueries) {
        const processPromises = createdQueries.map(async (query) => {
          await supabase
            .from('voice_search_queries')
            .update({ status: 'unavailable' })
            .eq('id', query.id);
          return 'unavailable';
        });


        // Don't await in the request path; finalize the test in the background.
        Promise.all(processPromises).then(async () => {
          /**
           * Gate on REAL DATA, not per-query statuses. A provider call that throws is
           * marked 'failed' rather than 'unavailable', so a status-based check could
           * pass while zero result rows exist — analysis would then divide by zero.
           * Count the rows actually written to voice_search_results for this test.
           */
          const queryIds = createdQueries.map((q) => q.id);
          const { count: resultCount } = await supabase
            .from('voice_search_results')
            .select('id', { count: 'exact', head: true })
            .in('query_id', queryIds);

          if (!resultCount || resultCount === 0) {
            // Nothing real was collected — never score or report on empty data.
            console.log(`Test ${testId} produced 0 result rows; marking unavailable`);
            await supabase
              .from('voice_search_tests')
              .update({ status: 'unavailable' })
              .eq('id', testId);
            return;
          }

          await supabase.functions.invoke('voice-search-analysis', {
            body: { testId }
          });

          await supabase
            .from('voice_search_tests')
            .update({ status: 'completed' })
            .eq('id', testId);
        });

      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Test started successfully',
        queryCount: queries.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'status') {
      // Get test status and progress
      const { data: test } = await supabase
        .from('voice_search_tests')
        .select('status')
        .eq('id', testId)
        .single();

      const { data: queries } = await supabase
        .from('voice_search_queries')
        .select('status')
        .eq('test_id', testId);

      const totalQueries = queries?.length || 0;
      const completedQueries = queries?.filter(q => q.status === 'completed').length || 0;
      const failedQueries = queries?.filter(q => q.status === 'failed').length || 0;
      // Queries whose provider has no live data source (edge function returned 501).
      const unavailableQueries = queries?.filter(q => q.status === 'unavailable').length || 0;

      return new Response(JSON.stringify({ 
        status: test?.status,
        progress: {
          total: totalQueries,
          completed: completedQueries,
          failed: failedQueries,
          unavailable: unavailableQueries,
          percentage: totalQueries > 0 ? Math.round((completedQueries + failedQueries + unavailableQueries) / totalQueries * 100) : 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in voice-search-orchestrator:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
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

      const market = `${test.market_city}, ${test.market_state}`;
      const functionsBase = `${Deno.env.get('SUPABASE_URL')}/functions/v1`;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

      /**
       * Invoke a provider analyzer over HTTP so we can inspect the status code.
       * A 501 means the provider has no live data source configured — we must NOT
       * treat that as a completed query, otherwise the customer gets a report
       * built from nothing.
       */
      const callProvider = async (fn: string, body: Record<string, unknown>) => {
        const res = await fetch(`${functionsBase}/${fn}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify(body),
        });
        return res.status;
      };

      // Process queries in parallel
      if (createdQueries) {
        const processPromises = createdQueries.map(async (query) => {
          try {
            let status: number | undefined;
            switch (query.assistant) {
              case 'google':
                status = await callProvider('google-search-analyzer', {
                  queryId: query.id,
                  question: query.question,
                  market,
                });
                break;
              case 'bing':
                status = await callProvider('bing-search-analyzer', {
                  queryId: query.id,
                  question: query.question,
                  market,
                });
                break;
              case 'siri':
              case 'alexa':
                status = await callProvider('voice-assistant-simulator', {
                  queryId: query.id,
                  question: query.question,
                  assistant: query.assistant,
                  market,
                });
                break;
            }

            // 501 = provider_unavailable: no data was produced for this query.
            const queryStatus =
              status === 501 || status === undefined
                ? 'unavailable'
                : status >= 200 && status < 300
                ? 'completed'
                : 'failed';

            await supabase
              .from('voice_search_queries')
              .update({ status: queryStatus })
              .eq('id', query.id);

            return queryStatus;
          } catch (error) {
            console.error(`Error processing query ${query.id}:`, error);
            await supabase
              .from('voice_search_queries')
              .update({ status: 'failed' })
              .eq('id', query.id);
            return 'failed';
          }
        });

        // Don't await in the request path; finalize the test in the background.
        Promise.all(processPromises).then(async (statuses) => {
          const allUnavailable =
            statuses.length > 0 && statuses.every((s) => s === 'unavailable');

          if (allUnavailable) {
            // Nothing real was collected — never score or report on empty data.
            console.log(`Test ${testId} had no available providers; marking unavailable`);
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
          percentage: totalQueries > 0 ? Math.round((completedQueries + failedQueries) / totalQueries * 100) : 0
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
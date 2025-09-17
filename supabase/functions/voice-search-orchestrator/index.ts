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

      // Process queries in parallel
      if (createdQueries) {
        const processPromises = createdQueries.map(async (query) => {
          try {
            let result;
            switch (query.assistant) {
              case 'google':
                result = await supabase.functions.invoke('google-search-analyzer', {
                  body: { 
                    queryId: query.id,
                    question: query.question, 
                    market: `${test.market_city}, ${test.market_state}` 
                  }
                });
                break;
              case 'bing':
                result = await supabase.functions.invoke('bing-search-analyzer', {
                  body: { 
                    queryId: query.id,
                    question: query.question, 
                    market: `${test.market_city}, ${test.market_state}` 
                  }
                });
                break;
              case 'siri':
              case 'alexa':
                // Simulate responses for now
                result = await supabase.functions.invoke('voice-assistant-simulator', {
                  body: { 
                    queryId: query.id,
                    question: query.question, 
                    assistant: query.assistant,
                    market: `${test.market_city}, ${test.market_state}` 
                  }
                });
                break;
            }

            await supabase
              .from('voice_search_queries')
              .update({ status: 'completed' })
              .eq('id', query.id);

          } catch (error) {
            console.error(`Error processing query ${query.id}:`, error);
            await supabase
              .from('voice_search_queries')
              .update({ status: 'failed' })
              .eq('id', query.id);
          }
        });

        // Don't await all promises, let them run in background
        Promise.all(processPromises).then(async () => {
          // When all queries complete, run analysis
          await supabase.functions.invoke('voice-search-analysis', {
            body: { testId }
          });

          // Update test status
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

      return new Response(JSON.stringify({ 
        status: test?.status,
        progress: {
          total: totalQueries,
          completed: completedQueries,
          failed: failedQueries,
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
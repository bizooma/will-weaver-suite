import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * google-search-analyzer
 *
 * There is currently NO live Google Search / AI Overview data provider wired up.
 * Previously this function inserted a placeholder row into `voice_search_results`,
 * which downstream scoring turned into a real-looking (but fabricated) report.
 *
 * It now writes NOTHING and reports 501 provider_unavailable so the orchestrator
 * can mark the query/test as 'unavailable' instead of 'completed'.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('google-search-analyzer invoked but no live provider is configured');

  return new Response(
    JSON.stringify({ error: 'provider_unavailable', provider: 'google' }),
    { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

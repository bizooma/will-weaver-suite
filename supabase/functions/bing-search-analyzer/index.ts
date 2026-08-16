import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * bing-search-analyzer
 *
 * No live Bing Web Search / Copilot provider is configured. This function used to
 * insert placeholder rows into `voice_search_results`, producing fabricated
 * analytics for customers. It now writes nothing and returns 501.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('bing-search-analyzer invoked but no live provider is configured');

  return new Response(
    JSON.stringify({ error: 'provider_unavailable', provider: 'bing' }),
    { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

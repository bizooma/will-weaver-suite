import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * voice-assistant-simulator (Siri / Alexa)
 *
 * No SiriKit or Alexa Skills Kit integration exists. This function previously
 * inserted simulated rows into `voice_search_results`, which were then scored as
 * if they were real assistant answers. It now writes nothing and returns 501.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Best-effort read of the requested assistant so the error names the provider.
  let provider = 'siri';
  try {
    const body = await req.json();
    if (body?.assistant === 'alexa' || body?.assistant === 'siri') {
      provider = body.assistant;
    }
  } catch {
    // Ignore malformed/empty bodies — we fail closed either way.
  }

  console.log(`voice-assistant-simulator invoked (${provider}) but no live provider is configured`);

  return new Response(
    JSON.stringify({ error: 'provider_unavailable', provider }),
    { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});

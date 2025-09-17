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

    const { queryId, question, assistant, market } = await req.json();

    let mockResults;
    let voiceTranscript;

    if (assistant === 'siri') {
      mockResults = {
        business_results: [
          {
            name: "Adams & Partners Law",
            phone: "(555) 345-6789",
            address: "456 Court St, " + market,
            rating: 4.8,
            category: "Attorney"
          }
        ],
        general_response: `I found several attorneys in ${market} who can help with your legal question. Would you like me to call Adams & Partners Law for you?`
      };
      
      voiceTranscript = `I found several attorneys in ${market} who can help with your legal question. Adams & Partners Law has good reviews and is located on Court Street. Would you like me to call them for you?`;
    } else {
      // Alexa
      mockResults = {
        skill_results: [
          {
            skill_name: "Legal Help Finder",
            response: `Based on your location in ${market}, I found local attorneys who specialize in your legal area. The top-rated option is Davis Legal Group with 4.9 stars.`
          }
        ],
        general_response: `For legal questions in ${market}, I recommend contacting a qualified attorney. Would you like me to search for attorneys near you?`
      };
      
      voiceTranscript = `For legal questions in ${market}, I recommend contacting a qualified attorney. Based on your location, Davis Legal Group is highly rated with 4.9 stars. Would you like me to search for more attorneys near you?`;
    }

    // Store results in database
    await supabase
      .from('voice_search_results')
      .insert({
        query_id: queryId,
        assistant: assistant,
        raw_results: mockResults,
        snippets: assistant === 'siri' ? mockResults.business_results : mockResults.skill_results,
        source_urls: [],
        ai_overview_text: mockResults.general_response,
        local_pack_results: assistant === 'siri' ? mockResults.business_results : [],
        voice_transcript: voiceTranscript
      });

    console.log(`${assistant} simulation completed for query ${queryId}`);

    return new Response(JSON.stringify({ 
      success: true,
      results: mockResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error in voice-assistant-simulator (${assistant}):`, error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
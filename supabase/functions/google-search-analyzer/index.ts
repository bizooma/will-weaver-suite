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

    const { queryId, question, market } = await req.json();

    // For now, create mock Google search results since we need Google Custom Search API
    // In production, this would use Google Custom Search API
    const mockResults = {
      organic_results: [
        {
          title: "Legal Services in " + market,
          url: "https://example-law-firm.com",
          snippet: "Professional legal services including personal injury, estate planning, and business law.",
          position: 1
        },
        {
          title: "Attorney Directory - " + market,
          url: "https://attorney-directory.com",
          snippet: "Find qualified attorneys in your area for all legal matters.",
          position: 2
        }
      ],
      ai_overview: {
        text: `For ${question} in ${market}, you should consult with a qualified attorney who specializes in the relevant area of law. Local attorneys can provide personalized advice based on your specific situation and local regulations.`,
        sources: [
          "https://example-law-firm.com",
          "https://bar-association.org"
        ]
      },
      local_pack: [
        {
          business_name: "Smith & Associates Law Firm",
          address: "123 Main St, " + market,
          phone: "(555) 123-4567",
          rating: 4.8,
          reviews: 156,
          position: 1
        },
        {
          business_name: "Legal Partners LLC", 
          address: "456 Oak Ave, " + market,
          phone: "(555) 987-6543",
          rating: 4.6,
          reviews: 89,
          position: 2
        }
      ]
    };

    // Store results in database
    await supabase
      .from('voice_search_results')
      .insert({
        query_id: queryId,
        assistant: 'google',
        raw_results: mockResults,
        snippets: mockResults.organic_results.map(r => ({
          title: r.title,
          snippet: r.snippet,
          url: r.url,
          position: r.position
        })),
        source_urls: mockResults.organic_results.map(r => r.url),
        ai_overview_text: mockResults.ai_overview?.text,
        local_pack_results: mockResults.local_pack,
        voice_transcript: `According to Google, ${mockResults.ai_overview?.text}`
      });

    console.log(`Google search analysis completed for query ${queryId}`);

    return new Response(JSON.stringify({ 
      success: true,
      results: mockResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in google-search-analyzer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
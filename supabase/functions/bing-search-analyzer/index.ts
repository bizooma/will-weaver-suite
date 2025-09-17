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

    // For now, create mock Bing search results since we need Bing Search API
    // In production, this would use Bing Web Search API
    const mockResults = {
      web_results: [
        {
          name: "Best Lawyers in " + market,
          url: "https://bestlawyers-example.com",
          snippet: "Top-rated attorneys providing comprehensive legal services in " + market,
          displayUrl: "bestlawyers-example.com"
        },
        {
          name: "Legal Help - " + market + " Attorneys",
          url: "https://legal-help.com",
          snippet: "Expert legal representation for personal injury, family law, and criminal defense.",
          displayUrl: "legal-help.com"
        }
      ],
      copilot_response: `Based on your question "${question}", I can help you find qualified legal professionals in ${market}. The most important factors to consider when selecting an attorney include their experience in your specific legal area, client reviews, and their track record of successful cases.`,
      local_businesses: [
        {
          name: "Johnson Law Group",
          address: "789 Pine St, " + market,
          telephone: "(555) 234-5678",
          rating: 4.9,
          reviewCount: 203
        },
        {
          name: "Metro Legal Services",
          address: "321 Elm St, " + market, 
          telephone: "(555) 876-5432",
          rating: 4.7,
          reviewCount: 124
        }
      ]
    };

    // Store results in database
    await supabase
      .from('voice_search_results')
      .insert({
        query_id: queryId,
        assistant: 'bing',
        raw_results: mockResults,
        snippets: mockResults.web_results.map((r, i) => ({
          title: r.name,
          snippet: r.snippet,
          url: r.url,
          position: i + 1
        })),
        source_urls: mockResults.web_results.map(r => r.url),
        ai_overview_text: mockResults.copilot_response,
        local_pack_results: mockResults.local_businesses,
        voice_transcript: `According to Bing Copilot, ${mockResults.copilot_response}`
      });

    console.log(`Bing search analysis completed for query ${queryId}`);

    return new Response(JSON.stringify({ 
      success: true,
      results: mockResults 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in bing-search-analyzer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
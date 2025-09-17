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

    const { testId, firmDomain, firmBusinessName } = await req.json();

    // Get all results for this test
    const { data: results } = await supabase
      .from('voice_search_results')
      .select(`
        *,
        voice_search_queries (
          question,
          assistant
        )
      `)
      .in('query_id', 
        (await supabase
          .from('voice_search_queries')
          .select('id')
          .eq('test_id', testId)
        ).data?.map(q => q.id) || []
      );

    if (!results) {
      throw new Error('No results found for analysis');
    }

    // Calculate presence score
    let presenceCount = 0;
    let totalQueries = results.length;

    // Calculate frequency score
    let mentionCount = 0;
    const assistantPerformance: { [key: string]: { mentions: number, total: number } } = {};

    // Analyze competitor data
    const competitorFrequency: { [key: string]: number } = {};

    results.forEach(result => {
      const assistant = result.voice_search_queries.assistant;
      
      if (!assistantPerformance[assistant]) {
        assistantPerformance[assistant] = { mentions: 0, total: 0 };
      }
      assistantPerformance[assistant].total++;

      // Check if firm appears in results
      const firmMentioned = checkFirmMention(result, firmDomain, firmBusinessName);
      if (firmMentioned) {
        presenceCount++;
        mentionCount++;
        assistantPerformance[assistant].mentions++;
      }

      // Extract competitor information
      const competitors = extractCompetitors(result);
      competitors.forEach(comp => {
        competitorFrequency[comp] = (competitorFrequency[comp] || 0) + 1;
      });
    });

    // Calculate scores
    const presenceScore = Math.round((presenceCount / totalQueries) * 100);
    const frequencyScore = Math.round((mentionCount / totalQueries) * 100);
    
    // Calculate competitive score based on ranking vs competitors
    const topCompetitors = Object.entries(competitorFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    const competitiveScore = calculateCompetitiveScore(presenceCount, topCompetitors, totalQueries);
    const overallScore = Math.round((presenceScore + frequencyScore + competitiveScore) / 3);

    // Generate optimization suggestions
    const optimizationSuggestions = generateOptimizationSuggestions(
      assistantPerformance,
      topCompetitors,
      presenceScore
    );

    // Check compliance issues
    const complianceIssues = checkComplianceIssues(results);

    // Store analysis
    await supabase
      .from('voice_search_analysis')
      .insert({
        test_id: testId,
        firm_domain: firmDomain,
        firm_business_name: firmBusinessName,
        presence_score: presenceScore,
        frequency_score: frequencyScore,
        competitive_score: competitiveScore,
        overall_score: overallScore,
        competitor_data: {
          topCompetitors,
          assistantPerformance
        },
        optimization_suggestions: optimizationSuggestions,
        compliance_issues: complianceIssues
      });

    console.log(`Analysis completed for test ${testId}`);

    return new Response(JSON.stringify({ 
      success: true,
      analysis: {
        presenceScore,
        frequencyScore,
        competitiveScore,
        overallScore,
        topCompetitors,
        optimizationSuggestions
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in voice-search-analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function checkFirmMention(result: any, firmDomain?: string, firmBusinessName?: string): boolean {
  const searchTexts = [
    result.ai_overview_text,
    result.voice_transcript,
    JSON.stringify(result.snippets),
    JSON.stringify(result.local_pack_results)
  ].filter(Boolean).join(' ').toLowerCase();

  if (firmDomain) {
    const domain = firmDomain.replace(/^https?:\/\//, '').toLowerCase();
    if (searchTexts.includes(domain)) return true;
  }

  if (firmBusinessName) {
    if (searchTexts.includes(firmBusinessName.toLowerCase())) return true;
  }

  return false;
}

function extractCompetitors(result: any): string[] {
  const competitors = new Set<string>();
  
  // Extract from local pack results
  if (result.local_pack_results && Array.isArray(result.local_pack_results)) {
    result.local_pack_results.forEach((business: any) => {
      if (business.business_name || business.name) {
        competitors.add(business.business_name || business.name);
      }
    });
  }

  // Extract from snippets
  if (result.snippets && Array.isArray(result.snippets)) {
    result.snippets.forEach((snippet: any) => {
      if (snippet.title?.includes('Law') || snippet.title?.includes('Attorney')) {
        const title = snippet.title.split(' - ')[0];
        competitors.add(title);
      }
    });
  }

  return Array.from(competitors);
}

function calculateCompetitiveScore(firmMentions: number, topCompetitors: [string, number][], totalQueries: number): number {
  if (topCompetitors.length === 0) return 100;
  
  const topCompetitorMentions = topCompetitors[0][1];
  if (firmMentions >= topCompetitorMentions) return 100;
  if (firmMentions === 0) return 0;
  
  return Math.round((firmMentions / topCompetitorMentions) * 100);
}

function generateOptimizationSuggestions(
  assistantPerformance: any,
  topCompetitors: [string, number][],
  presenceScore: number
): any {
  const suggestions = [];

  if (presenceScore < 30) {
    suggestions.push({
      priority: 'high',
      category: 'GBP Optimization',
      title: 'Improve Google Business Profile',
      description: 'Your firm has low visibility across voice assistants. Optimize your Google Business Profile with complete information, photos, and regular posts.',
      impact: 85
    });
  }

  if (assistantPerformance.google?.mentions === 0) {
    suggestions.push({
      priority: 'high', 
      category: 'SEO',
      title: 'Add FAQ Schema Markup',
      description: 'Implement FAQ schema on your website to increase chances of appearing in Google AI Overviews.',
      impact: 75
    });
  }

  if (topCompetitors.length > 0) {
    suggestions.push({
      priority: 'medium',
      category: 'Reviews',
      title: 'Review Acquisition Campaign',
      description: `Your top competitor ${topCompetitors[0][0]} appears frequently. Focus on collecting more client reviews to improve local rankings.`,
      impact: 65
    });
  }

  suggestions.push({
    priority: 'medium',
    category: 'Apple Business Connect',
    title: 'Apple Business Connect Setup', 
    description: 'Claim and optimize your Apple Business Connect listing to improve Siri responses.',
    impact: 50
  });

  return suggestions;
}

function checkComplianceIssues(results: any[]): any {
  const issues = [];
  
  results.forEach(result => {
    const content = [
      result.ai_overview_text,
      result.voice_transcript,
      JSON.stringify(result.snippets)
    ].filter(Boolean).join(' ');

    // Check for attorney advertising compliance
    if (content.includes('attorney') || content.includes('lawyer')) {
      if (!content.includes('advertising') && !content.includes('disclaimer')) {
        issues.push({
          type: 'attorney_advertising',
          description: 'Legal advertising disclaimers may be required',
          severity: 'medium'
        });
      }
    }
  });

  return issues;
}
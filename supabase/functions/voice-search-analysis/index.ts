import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Domains that are directories, aggregators, or general-purpose sites. They are
 * NOT law firms competing with the customer, so they must never be reported as
 * "top competitors" (which previously produced advice like "your top competitor
 * superlawyers.com appears frequently").
 */
const EXCLUDED_COMPETITOR_DOMAINS = [
  'superlawyers.com', 'avvo.com', 'martindale.com', 'findlaw.com', 'justia.com',
  'lawyers.com', 'nolo.com', 'yelp.com', 'google.com', 'wikipedia.org',
  'lawinfo.com', 'legalzoom.com', 'bbb.org', 'facebook.com', 'linkedin.com',
  'reddit.com', 'youtube.com', 'yellowpages.com', 'thumbtack.com',
  'americanbar.org', 'usa.gov', 'nolo.co', 'quora.com', 'x.com', 'twitter.com',
  'instagram.com', 'tiktok.com', 'trustpilot.com', 'mapquest.com',
];

/** True when a domain/name is a directory or otherwise not a real firm. */
function isExcludedCompetitor(raw: string): boolean {
  const d = raw.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  return EXCLUDED_COMPETITOR_DOMAINS.some((x) => d === x || d.endsWith(`.${x}`));
}

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

    /**
     * Two plain queries instead of a PostgREST embedded join. The embedded
     * select silently returned nothing, which made every run look like
     * "no results". Joining in JS is explicit and always works.
     */
    const { data: queryRows, error: queriesError } = await supabase
      .from('voice_search_queries')
      .select('id, question, assistant')
      .eq('test_id', testId);

    if (queriesError) {
      console.error(`Error loading queries for test ${testId}:`, queriesError);
      throw queriesError;
    }

    const queryIds = (queryRows ?? []).map((q) => q.id);
    const queryById = new Map((queryRows ?? []).map((q) => [q.id, q]));

    let results: any[] = [];
    if (queryIds.length > 0) {
      const { data: resultRows, error: resultsError } = await supabase
        .from('voice_search_results')
        .select('*')
        .in('query_id', queryIds);

      if (resultsError) {
        console.error(`Error loading results for test ${testId}:`, resultsError);
        throw resultsError;
      }

      results = (resultRows ?? []).map((r) => ({
        ...r,
        voice_search_queries: queryById.get(r.query_id) ?? { question: '', assistant: r.assistant },
      }));
    }

    // Never analyze an empty result set — scoring would divide by zero.
    if (results.length === 0) {
      console.log(`No results for test ${testId}; skipping analysis`);
      return new Response(JSON.stringify({ skipped: true, reason: 'no_results' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const businessName = String(firmBusinessName || '').trim();
    const domain = String(firmDomain || '')
      .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '')
      .toLowerCase();

    /**
     * SCORING UNIT = ONE MODEL ANSWER, not one question. This is the same
     * denominator ai-visibility-check uses, so voice_search_analysis and
     * ai_visibility_runs can no longer disagree (100 vs 58 previously).
     *
     * Each voice_search_results row carries a `snippets` array where every
     * entry is one platform's answer: { title: platform, snippet, confidence }.
     */
    type PlatformStat = { mentions: number; total: number };
    const platformPerformance: Record<string, PlatformStat> = {};
    const competitorFrequency: Record<string, number> = {};

    let scoredAnswers = 0;       // model answers included in the score
    let mentionAnswers = 0;      // of those, how many named the firm
    let brandedQuestions = 0;    // questions skipped for containing the firm name

    for (const result of results) {
      const question = String(result.voice_search_queries?.question || '');

      /**
       * BRANDED QUERIES ARE EXCLUDED. If the question itself contains the firm
       * name, the answer is guaranteed to repeat it — that measures nothing and
       * inflates presence. The row is still returned to the UI (which labels it),
       * it simply does not count toward the score.
       */
      const isBranded = !!businessName &&
        question.toLowerCase().includes(businessName.toLowerCase());
      if (isBranded) brandedQuestions++;

      const snippets: any[] = Array.isArray(result.snippets) ? result.snippets : [];

      for (const s of snippets) {
        const platform = String(s?.title || result.assistant || 'unknown').toLowerCase();
        const text = String(s?.snippet || '');
        // A mention is asserted either by the stored confidence (>0, written by
        // ai-visibility-check) or by the firm name/domain appearing in the text.
        const hasMention =
          Number(s?.confidence ?? 0) > 0 ||
          (!!domain && text.toLowerCase().includes(domain)) ||
          (!!businessName && text.toLowerCase().includes(businessName.toLowerCase()));

        if (isBranded) continue; // never counted, in any denominator

        platformPerformance[platform] ??= { mentions: 0, total: 0 };
        platformPerformance[platform].total++;
        scoredAnswers++;
        if (hasMention) {
          platformPerformance[platform].mentions++;
          mentionAnswers++;
        }
      }

      // Competitors: real firm domains only, directories filtered out.
      for (const comp of extractCompetitors(result)) {
        if (isExcludedCompetitor(comp)) continue;
        if (domain && comp.toLowerCase().includes(domain)) continue;
        competitorFrequency[comp] = (competitorFrequency[comp] || 0) + 1;
      }
    }

    // presence == frequency at answer granularity; both are kept for schema
    // compatibility and are computed from the identical real denominator.
    const presenceScore = scoredAnswers > 0
      ? Math.round((mentionAnswers / scoredAnswers) * 100)
      : 0;
    const frequencyScore = presenceScore;

    const topCompetitors = Object.entries(competitorFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const competitiveScore = calculateCompetitiveScore(mentionAnswers, topCompetitors);
    const overallScore = Math.round((presenceScore + frequencyScore + competitiveScore) / 3);

    // "Gemini 6/6, ChatGPT 0/6" — the split is the most useful number here.
    const platformBreakdown = Object.entries(platformPerformance).map(([platform, s]) => ({
      platform,
      mentions: s.mentions,
      total: s.total,
      score: s.total > 0 ? Math.round((s.mentions / s.total) * 100) : 0,
    }));

    const optimizationSuggestions = generateOptimizationSuggestions(
      platformBreakdown,
      topCompetitors,
      presenceScore,
      scoredAnswers,
    );

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
          platformBreakdown,
          scoredAnswers,
          mentionAnswers,
          brandedQuestionsExcluded: brandedQuestions,
        },
        optimization_suggestions: optimizationSuggestions,
        // Nothing in this codebase actually checks attorney advertising
        // compliance, so we never fabricate findings here. Column kept, empty.
        compliance_issues: []
      });

    console.log(`Analysis completed for test ${testId}`);

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        presenceScore,
        frequencyScore,
        competitiveScore,
        overallScore,
        platformBreakdown,
        scoredAnswers,
        mentionAnswers,
        brandedQuestionsExcluded: brandedQuestions,
        topCompetitors,
        optimizationSuggestions
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in voice-search-analysis:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/** Competitor names/domains surfaced by the assistants for one result row. */
function extractCompetitors(result: any): string[] {
  const competitors = new Set<string>();

  if (result.local_pack_results && Array.isArray(result.local_pack_results)) {
    result.local_pack_results.forEach((business: any) => {
      const name = business?.business_name || business?.name;
      if (name) competitors.add(String(name));
    });
  }

  return Array.from(competitors);
}

/**
 * How the firm stacks up against the most frequently surfaced real competitor.
 * Purely derived from the counts observed in this run.
 */
function calculateCompetitiveScore(firmMentions: number, topCompetitors: [string, number][]): number {
  if (topCompetitors.length === 0) return firmMentions > 0 ? 100 : 0;

  const topCompetitorMentions = topCompetitors[0][1];
  if (firmMentions >= topCompetitorMentions) return 100;
  if (firmMentions === 0) return 0;

  return Math.round((firmMentions / topCompetitorMentions) * 100);
}

/**
 * Every suggestion below is DERIVED FROM THIS RUN's numbers — no hardcoded
 * advice, no invented impact scores. Suggestions about channels we do not
 * measure (e.g. Siri / Apple Business Connect) were removed outright.
 */
function generateOptimizationSuggestions(
  platformBreakdown: { platform: string; mentions: number; total: number; score: number }[],
  topCompetitors: [string, number][],
  presenceScore: number,
  scoredAnswers: number,
): any {
  const suggestions: any[] = [];

  if (scoredAnswers === 0) return suggestions;

  // Overall visibility gap: impact is the measured percentage of answers that
  // failed to name the firm.
  if (presenceScore < 100) {
    suggestions.push({
      priority: presenceScore < 30 ? 'high' : presenceScore < 70 ? 'medium' : 'low',
      category: 'AI Visibility',
      title: `Firm named in ${presenceScore}% of AI answers`,
      description: `Your firm appeared in ${presenceScore}% of the ${scoredAnswers} AI assistant answers measured in this run. Publish authoritative, question-shaped content for the topics below so assistants have a reason to cite you.`,
      impact: 100 - presenceScore,
    });
  }

  // Per-platform gaps, only for platforms actually queried.
  for (const p of platformBreakdown) {
    if (p.total > 0 && p.mentions === 0) {
      suggestions.push({
        priority: 'high',
        category: 'Platform Gap',
        title: `No mentions on ${p.platform}`,
        description: `${p.platform} named your firm in 0 of ${p.total} answers, while your overall rate is ${presenceScore}%. Strengthen the sources this platform draws on: your own site's FAQ content, and your Google Business Profile.`,
        impact: Math.round((p.total / Math.max(scoredAnswers, 1)) * 100),
      });
    } else if (p.total > 0 && p.score < presenceScore) {
      suggestions.push({
        priority: 'medium',
        category: 'Platform Gap',
        title: `${p.platform} lags at ${p.score}%`,
        description: `${p.platform} named your firm in ${p.mentions} of ${p.total} answers (${p.score}%), below your ${presenceScore}% average.`,
        impact: presenceScore - p.score,
      });
    }
  }

  // Competitor pressure, using only real firm domains observed in this run.
  if (topCompetitors.length > 0) {
    const [name, count] = topCompetitors[0];
    suggestions.push({
      priority: 'medium',
      category: 'Competitors',
      title: `${name} surfaced ${count} time${count === 1 ? '' : 's'}`,
      description: `${name} was recommended ${count} time${count === 1 ? '' : 's'} across the answers in this run. Review what that firm publishes on these topics and match or exceed its depth.`,
      impact: Math.round((count / Math.max(scoredAnswers, 1)) * 100),
    });
  }

  return suggestions;
}

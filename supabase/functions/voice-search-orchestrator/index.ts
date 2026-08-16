// Voice / AI Search orchestrator.
//
// What it does now: the only real visibility engine we have is the
// `ai-visibility-check` function, which asks live AI assistants (ChatGPT via
// gpt-5-mini, Gemini via gemini-2.5-flash through the Lovable AI Gateway) the
// firm's questions and detects mentions, citations and competitors. In 2026
// "voice search visibility" means being surfaced by those assistants, so this
// orchestrator routes the 'ai_assistants' provider to that engine and maps the
// answers back into the existing voice_search_results shape so the results UI
// and the analysis function keep working unchanged.
//
// Legacy SERP providers ('google', 'bing') have no data source wired up yet, so
// their queries are marked 'unavailable' and never produce result rows.
//
// SECURITY: this function uses the service role for database writes, so it MUST
// authenticate and authorize the caller itself. Every action resolves the
// caller's JWT (401 without a valid user) and verifies that the user owns the
// voice_search_tests row (403 otherwise). config.toml also sets
// verify_jwt = true for defense in depth.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** The single provider that can return real data today. */
const AI_ASSISTANTS = 'ai_assistants';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- 1. Authenticate the caller from their own JWT (never service role) ----
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // Service-role client for the privileged writes below (queries/results rows).
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { testId, action } = await req.json();
    if (!testId) return json({ error: 'testId is required' }, 400);

    // ---- 2. Authorize: the caller must own this test (both actions) ----
    const { data: test, error: testError } = await supabase
      .from('voice_search_tests')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    if (testError) throw testError;
    if (!test) return json({ error: 'Not found' }, 404);
    if (test.user_id !== user.id) return json({ error: 'Forbidden' }, 403);

    if (action === 'start') {
      // Cap the workload: ai-visibility-check queries 2 models per prompt with a
      // pacing delay between calls, so more than 8 questions cannot finish inside
      // the edge function time limit. Enforced here as well as in the UI.
      const MAX_QUESTIONS = 8;
      const questions: string[] = (test.test_questions || [])
        .filter((q: string) => q?.trim())
        .slice(0, MAX_QUESTIONS);
      const assistants: string[] = test.selected_assistants || [];


      // One query row per (question, assistant) pair — unchanged contract.
      const queries = [];
      for (const question of questions) {
        for (const assistant of assistants) {
          queries.push({ test_id: testId, question, assistant, status: 'pending' });
        }
      }

      const { error: queryError } = await supabase
        .from('voice_search_queries')
        .insert(queries);
      if (queryError) throw queryError;

      await supabase
        .from('voice_search_tests')
        .update({ status: 'running' })
        .eq('id', testId);

      const { data: createdQueries } = await supabase
        .from('voice_search_queries')
        .select('*')
        .eq('test_id', testId)
        .eq('status', 'pending');

      if (createdQueries) {
        const aiQueries = createdQueries.filter((q) => q.assistant === AI_ASSISTANTS);
        const legacyQueries = createdQueries.filter((q) => q.assistant !== AI_ASSISTANTS);

        // Legacy SERP providers have no live data source: mark unavailable, write nothing.
        for (const q of legacyQueries) {
          await supabase
            .from('voice_search_queries')
            .update({ status: 'unavailable' })
            .eq('id', q.id);
        }

        const work = (async () => {
          if (aiQueries.length === 0) return;

          const settings = (test.settings || {}) as Record<string, unknown>;
          const domain = String(settings.firmDomain || '').trim();

          // Without a firm domain there is nothing to detect a mention of.
          if (!domain) {
            for (const q of aiQueries) {
              await supabase
                .from('voice_search_queries')
                .update({ status: 'unavailable' })
                .eq('id', q.id);
            }
            return;
          }

          const prompts = [...new Set(aiQueries.map((q) => q.question))];

          // Forward the CALLER's Authorization header — ai-visibility-check
          // authenticates the end user itself and must not be called with the
          // service role key.
          const res = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-visibility-check`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
                apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
              },
              body: JSON.stringify({ domain, prompts }),
            },
          );

          if (!res.ok) {
            const body = await res.text();
            console.error('ai-visibility-check failed:', res.status, body);
            for (const q of aiQueries) {
              await supabase
                .from('voice_search_queries')
                .update({ status: 'failed' })
                .eq('id', q.id);
            }
            return;
          }

          const payload = await res.json();
          const perPrompt = Array.isArray(payload?.results) ? payload.results : [];

          for (const q of aiQueries) {
            // All platform answers for this question (one per model).
            const matches = perPrompt.filter((r: any) => r.prompt === q.question);
            if (matches.length === 0) {
              await supabase
                .from('voice_search_queries')
                .update({ status: 'unavailable' })
                .eq('id', q.id);
              continue;
            }

            const hasMention = matches.some((m: any) => m.hasMention);
            // mention_text is the sentence containing the firm when mentioned,
            // otherwise the assistant's answer — either way it is the snippet.
            const snippetText = matches
              .map((m: any) => `${m.platform}: ${m.mentionText || ''}`.trim())
              .join('\n\n');
            const competitors = [
              ...new Set(matches.flatMap((m: any) => m.competitors || [])),
            ] as string[];

            const { error: insertError } = await supabase
              .from('voice_search_results')
              .insert({
                query_id: q.id,
                assistant: AI_ASSISTANTS,
                // Drives presence detection in voice-search-analysis: only include
                // the firm-bearing text when a mention was actually detected.
                ai_overview_text: hasMention ? snippetText : null,
                voice_transcript: snippetText,
                snippets: matches.map((m: any) => ({
                  title: m.platform,
                  snippet: m.mentionText || '',
                  is_citation: !!m.isCitation,
                  confidence: m.confidence ?? 0,
                })),
                // Competitor domains surfaced by the assistants.
                local_pack_results: competitors.map((c) => ({ name: c })),
                source_urls: [],
                raw_results: { platforms: matches },
              });

            await supabase
              .from('voice_search_queries')
              .update({ status: insertError ? 'failed' : 'completed' })
              .eq('id', q.id);

            if (insertError) console.error('Result insert failed:', insertError);
          }
        })();

        // Finalize in the background; never block the request on model latency.
        work.then(async () => {
          /**
           * Gate on REAL DATA, not per-query statuses: count the rows actually
           * written to voice_search_results for this test. Zero rows means we
           * never score or report.
           */
          const queryIds = createdQueries.map((q) => q.id);
          const { count: resultCount } = await supabase
            .from('voice_search_results')
            .select('id', { count: 'exact', head: true })
            .in('query_id', queryIds);

          if (!resultCount || resultCount === 0) {
            console.log(`Test ${testId} produced 0 result rows; marking unavailable`);
            await supabase
              .from('voice_search_tests')
              .update({ status: 'unavailable' })
              .eq('id', testId);
            return;
          }

          const settings = (test.settings || {}) as Record<string, unknown>;
          await supabase.functions.invoke('voice-search-analysis', {
            body: {
              testId,
              firmDomain: settings.firmDomain,
              firmBusinessName: settings.firmBusinessName,
            },
          });

          await supabase
            .from('voice_search_tests')
            .update({ status: 'completed' })
            .eq('id', testId);
        }).catch((e) => console.error('Finalize failed:', e));
      }

      return json({
        success: true,
        message: 'Test started successfully',
        queryCount: queries.length,
      });
    }

    if (action === 'status') {
      const { data: queries } = await supabase
        .from('voice_search_queries')
        .select('status')
        .eq('test_id', testId);

      const totalQueries = queries?.length || 0;
      const completedQueries = queries?.filter((q) => q.status === 'completed').length || 0;
      const failedQueries = queries?.filter((q) => q.status === 'failed').length || 0;
      const unavailableQueries = queries?.filter((q) => q.status === 'unavailable').length || 0;

      return json({
        status: test.status,
        progress: {
          total: totalQueries,
          completed: completedQueries,
          failed: failedQueries,
          unavailable: unavailableQueries,
          percentage: totalQueries > 0
            ? Math.round(((completedQueries + failedQueries + unavailableQueries) / totalQueries) * 100)
            : 0,
        },
      });
    }

    return json({ error: 'Invalid action' }, 400);
  } catch (error) {
    console.error('Error in voice-search-orchestrator:', error);
    return json({ error: (error as Error).message }, 500);
  }
});

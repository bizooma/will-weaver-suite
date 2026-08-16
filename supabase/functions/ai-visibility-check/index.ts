import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODELS = [
  { id: "openai/gpt-5-mini", platform: "openai" },
  { id: "google/gemini-2.5-flash", platform: "gemini" },
];
const MAX_PROMPTS = 20;

async function callAI(prompt: string, model: string, retries = 3): Promise<string> {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
  for (let attempt = 0; attempt < retries; attempt++) {
    // gpt-5 family models reject any non-default `temperature`, which made every
    // openai/* call fail with 400 while gemini succeeded. Omit it for openai.
    const body: Record<string, unknown> = {
      model,
      messages: [{ role: "user", content: prompt }],
    };
    if (!model.startsWith("openai/")) body.temperature = 0.3;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      if (content.trim()) return content;
    } else {
      // Always surface the gateway's body so the next failure is diagnosable.
      const errBody = await res.text().catch(() => "<unreadable>");
      console.error(`AI gateway error ${res.status} for ${model}:`, errBody);
      if (res.status === 402) throw new Error("AI credits depleted");
      if (res.status !== 429 && res.status < 500) throw new Error(`AI API failed: ${res.status}`);
    }
    await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
  }
  throw new Error("AI call failed after retries");
}

function extractDomains(text: string): string[] {
  const matches = text.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi) || [];
  return [...new Set(matches.map((d) => d.toLowerCase().replace(/^www\./, "")))];
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pull ~200 characters either side of the first match so the UI has real
 * evidence. The previous sentence-splitting approach split on periods, which
 * tore domains apart and never matched.
 */
function contextWindow(response: string, re: RegExp): string {
  const m = re.exec(response);
  if (!m) return "";
  const start = Math.max(0, m.index - 200);
  const end = Math.min(response.length, m.index + m[0].length + 200);
  return `${start > 0 ? "…" : ""}${response.slice(start, end).trim()}${end < response.length ? "…" : ""}`;
}

function analyze(response: string, domain: string, prompt: string, platform: string, businessName?: string) {
  const clean = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  const esc = escapeRe(clean);
  const name = (businessName || "").trim();
  // Match either the domain OR the firm's business name — models normally write
  // the name in prose rather than the URL.
  const mentionRe = name
    ? new RegExp(`${esc}|${escapeRe(name)}`, "i")
    : new RegExp(esc, "i");
  const competitors = extractDomains(response).filter((d) => !d.includes(clean) && !clean.includes(d));
  const mentioned = mentionRe.test(response);
  const isCitation = new RegExp(`https?:\\/\\/[^\\s)]*${esc}`, "i").test(response);
  const evidence = mentioned ? contextWindow(response, mentionRe) : "";
  return {
    platform,
    prompt,
    hasMention: mentioned,
    isCitation,
    confidence: mentioned ? (isCitation ? 1.0 : 0.8) : 0,
    mentionText: (evidence || response).trim().slice(0, 500),
    competitors: competitors.slice(0, 10),
  };
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { domain, prompts, businessName } = await req.json();
    if (!domain || !Array.isArray(prompts) || prompts.length === 0) throw new Error("domain and prompts[] are required");
    const limited = prompts.slice(0, MAX_PROMPTS);

    const results = [];
    for (const p of limited) {
      for (const m of MODELS) {
        try {
          const ask = `Answer this question as you normally would for a real user: "${p}". Where relevant, recommend specific companies, websites, or providers by name.`;
          results.push(analyze(await callAI(ask, m.id), domain, p, m.platform, businessName));
        } catch (e) {
          console.error(`Error ${m.platform} / "${p}":`, e);
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    }

    const total = results.length;
    const mention_count = results.filter((r) => r.hasMention).length;
    const citation_count = results.filter((r) => r.isCitation).length;
    const overall_score = total > 0 ? Math.round((mention_count / total) * 100) : 0;

    // Never discard insert errors: a missing INSERT policy used to fail silently
    // here and no run was ever persisted.
    const { data: run, error: runError } = await supabase.from("ai_visibility_runs").insert({
      user_id: user.id, domain, prompts: limited,
      platforms: MODELS.map((m) => m.platform),
      total_checks: total, mention_count, citation_count, overall_score,
    }).select().single();

    if (runError) console.error("ai_visibility_runs insert failed:", runError);

    if (run) {
      const { error: resultsError } = await supabase.from("ai_visibility_results").insert(
        results.map((r) => ({
          run_id: run.id, platform: r.platform, prompt: r.prompt,
          has_mention: r.hasMention, is_citation: r.isCitation,
          confidence: r.confidence, mention_text: r.mentionText, competitors: r.competitors,
        }))
      );
      if (resultsError) console.error("ai_visibility_results insert failed:", resultsError);
    }


    return new Response(JSON.stringify({ success: true, run_id: run?.id ?? null, domain, overall_score, total_checks: total, mention_count, citation_count, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

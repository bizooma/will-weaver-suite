import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { field, data, tone } = await req.json();

    const fieldLabel =
      field === "funeral_instructions"
        ? "Funeral & Burial Instructions"
        : field || "Clause";

    const userContext =
      typeof data === "string" ? data : JSON.stringify(data ?? {});

    const toneKey = ["plain","formal","compassionate","concise"].includes(tone) ? tone : "plain";
    const toneConfig = (
      {
        plain: { style: "Neutral, plain-English, respectful, clear", temp: 0.3 },
        formal: { style: "Formal legal drafting; precise, traditional", temp: 0.2 },
        compassionate: { style: "Warm, compassionate, supportive, professional", temp: 0.5 },
        concise: { style: "Concise, minimal wording while preserving meaning", temp: 0.2 },
      } as const
    )[toneKey as "plain"|"formal"|"compassionate"|"concise"];

    let jurisdiction = "";
    try {
      jurisdiction = typeof data === "object" && data && (data as any).state ? String((data as any).state) : "";
    } catch (_) { /* ignore */ }

    const prompt = `Draft a concise, plain-English legal clause for a Last Will and Testament.
- Clause type: ${fieldLabel}
- Context (JSON): ${userContext}
- Jurisdiction hint: ${jurisdiction || 'None'} (keep drafting jurisdiction-agnostic; do not cite statutes)
- Style: ${toneConfig.style}
- Length: 2-5 sentences. No placeholders like [Name] if provided in context. Avoid legalese when possible.
- Do NOT include disclaimers or headings. Output only the clause text.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a careful estate planning assistant that drafts short, precise clauses in a respectful tone.",
          },
          { role: "user", content: prompt },
        ],
        temperature: toneConfig.temp,
      }),
    });

    const dataJson = await resp.json();
    const result = dataJson?.choices?.[0]?.message?.content?.trim?.() ?? "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-generate-clause error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
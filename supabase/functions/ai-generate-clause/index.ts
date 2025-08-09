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

    const prompt = `Draft a concise, plain-English legal clause for a Last Will and Testament.
- Clause type: ${fieldLabel}
- Context (JSON): ${userContext}
- Style: Traditional estate planning tone; respectful, clear, and jurisdiction-agnostic.
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
        temperature: tone === "warmer" ? 0.8 : 0.4,
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
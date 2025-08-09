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

    const { messages = [], data = {}, draft = "", tone = "plain" } = await req.json();

    const toneStyles: Record<string, { style: string; temp: number }> = {
      plain: { style: "Neutral, plain-English, respectful, clear", temp: 0.3 },
      formal: { style: "Formal legal drafting; precise, traditional", temp: 0.2 },
      compassionate: { style: "Warm, compassionate, supportive, professional", temp: 0.5 },
      concise: { style: "Concise, minimal wording while preserving meaning", temp: 0.2 },
    };
    const cfg = toneStyles[tone] || toneStyles.plain;

    const contextMsg = `You are an estate-planning co-pilot that helps users fill a Last Will & Testament wizard.\n` +
      `- Provide practical, concise guidance in ${cfg.style.toLowerCase()}.\n` +
      `- Avoid legal advice and do not cite jurisdiction-specific statutes.\n` +
      `- When asked to draft a clause, output only the clause text.\n` +
      `- Current state: ${data?.state || 'N/A'}.\n` +
      `- Wizard data (JSON): ${JSON.stringify(data)}\n` +
      `- Current draft (excerpt):\n${String(draft).slice(0, 4000)}\n`;

    const chatMessages = [
      { role: "system", content: "You are a helpful, careful estate planning co-pilot." },
      { role: "user", content: contextMsg },
      ...(Array.isArray(messages) ? messages.slice(-10) : []),
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: chatMessages,
        temperature: cfg.temp,
      }),
    });

    const dataJson = await resp.json();
    const reply = dataJson?.choices?.[0]?.message?.content?.trim?.() ?? "";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-copilot error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
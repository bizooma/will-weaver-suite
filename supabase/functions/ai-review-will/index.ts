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

    const { draft, state } = await req.json();

    const schema = {
      type: "object",
      properties: {
        issues: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
        missing: { type: "array", items: { type: "string" } },
        summary: { type: "string" },
        checklist: { type: "array", items: { type: "string" } },
      },
      required: ["issues", "risks", "missing", "summary", "checklist"],
      additionalProperties: false,
    };

    const instruction = `You are an experienced estate-planning attorney. Analyze the user's draft Last Will and Testament for:\n- potential issues or ambiguities,\n- legal and practical risks,\n- missing information the user should supply,\n- a brief plain-English summary, and\n- a practical checklist of next steps.\nJurisdiction: ${state || "unknown"}. Keep it general and not legal advice.\nReturn STRICT JSON only with keys: issues, risks, missing, summary, checklist. Do not include backticks, markdown, or extra commentary.\n`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: instruction },
          { role: "user", content: draft?.toString?.() ?? "" },
        ],
        temperature: 0.2,
      }),
    });

    const dataJson = await response.json();
    const content = dataJson?.choices?.[0]?.message?.content ?? "";

    let parsed: any = null;
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      // Try to extract JSON via simple heuristic
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (_) { /* ignore */ }
      }
    }

    if (!parsed) {
      parsed = {
        issues: [],
        risks: [],
        missing: [],
        summary: content?.slice?.(0, 1000) || "",
        checklist: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-review-will error", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
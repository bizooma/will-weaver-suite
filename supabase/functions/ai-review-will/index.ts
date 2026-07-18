import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guardAuthed, jsonResponse } from "../_shared/security.ts";

// AI will-review endpoint. Auth required + 10 req/min per user (this is an
// expensive call — it reads the entire draft).
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  const guard = await guardAuthed(req, { maxBytes: 64_000, limit: 10, windowSeconds: 60 });
  if (guard instanceof Response) return guard;

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);

    const { draft, state } = await req.json();
    const draftText = String(draft ?? "").slice(0, 40_000); // cap draft length sent upstream

    const instruction = `You are an experienced estate-planning attorney. Analyze the user's draft Last Will and Testament for:\n- potential issues or ambiguities,\n- legal and practical risks,\n- missing information the user should supply,\n- a brief plain-English summary, and\n- a practical checklist of next steps.\nJurisdiction: ${state || "unknown"}. Keep it general and not legal advice.\nReturn STRICT JSON only with keys: issues, risks, missing, summary, checklist. Do not include backticks, markdown, or extra commentary.\n`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: instruction },
          { role: "user", content: draftText },
        ],
        temperature: 0.2,
      }),
    });

    const dataJson = await response.json();
    const content = dataJson?.choices?.[0]?.message?.content ?? "";

    let parsed: any = null;
    try { parsed = JSON.parse(content); } catch (_) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) { try { parsed = JSON.parse(match[0]); } catch (_) { /* ignore */ } }
    }
    if (!parsed) {
      parsed = { issues: [], risks: [], missing: [], summary: content?.slice?.(0, 1000) || "", checklist: [] };
    }
    return jsonResponse(parsed);
  } catch (error) {
    console.error("ai-review-will error", error);
    return jsonResponse({ error: String(error) }, 500);
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guardAuthed, jsonResponse } from "../_shared/security.ts";

// OpenAI TTS. Auth required + 30 req/min per user + 8 KB text cap (~4000 chars).
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const guard = await guardAuthed(req, { maxBytes: 8_000, limit: 30, windowSeconds: 60 });
  if (guard instanceof Response) return guard;

  try {
    const { text, voice } = await req.json();
    if (!text || typeof text !== "string") throw new Error("Text is required");
    // Hard cap text length going to the model
    const safeText = text.slice(0, 4000);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: safeText,
        voice: voice || "alloy",
        response_format: "mp3",
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to generate speech");
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return jsonResponse({ audioContent: base64Audio });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});

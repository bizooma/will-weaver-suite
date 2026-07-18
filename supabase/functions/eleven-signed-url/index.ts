import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, guardAuthed, jsonResponse } from "../_shared/security.ts";

// ElevenLabs signed-URL minter. Every mint burns billable ElevenLabs minutes
// once the client connects, so auth + tight per-user rate limit.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const guard = await guardAuthed(req, { maxBytes: 2_000, limit: 10, windowSeconds: 60 });
  if (guard instanceof Response) return guard;

  try {
    const ELEVEN_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN_API_KEY) return jsonResponse({ error: "Missing ELEVENLABS_API_KEY secret" }, 500);

    const { agentId } = await req.json();
    if (!agentId || typeof agentId !== "string") return jsonResponse({ error: "agentId is required" }, 400);

    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`;
    const resp = await fetch(url, { method: "GET", headers: { "xi-api-key": ELEVEN_API_KEY } });
    if (!resp.ok) throw new Error(`Failed to get signed URL: ${resp.status} ${await resp.text()}`);

    const body = await resp.json();
    return jsonResponse({ signed_url: body.signed_url || body.signedUrl });
  } catch (error) {
    console.error("eleven-signed-url error", error);
    return jsonResponse({ error: (error as Error).message }, 500);
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ELEVEN_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVEN_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing ELEVENLABS_API_KEY secret" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { agentId } = await req.json();
    if (!agentId) {
      return new Response(
        JSON.stringify({ error: "agentId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`;
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVEN_API_KEY,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Failed to get signed URL: ${resp.status} ${text}`);
    }

    const body = await resp.json();
    return new Response(JSON.stringify({ signed_url: body.signed_url || body.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("eleven-signed-url error", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
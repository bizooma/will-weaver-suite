import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = authHeader.replace("Bearer ", "");
    
    // Validate API key format
    if (!apiKey.startsWith("sk_") || apiKey.length !== 67) {
      return new Response(JSON.stringify({ error: "Invalid API key format" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify API key exists and is active
    const { data: keyData, error: keyError } = await supabase
      .from("user_api_keys")
      .select("user_id, is_active, last_used_at")
      .eq("api_key", apiKey)
      .eq("is_active", true)
      .single();

    if (keyError || !keyData) {
      console.error("API key validation error:", keyError);
      return new Response(JSON.stringify({ error: "Invalid or inactive API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update last_used_at timestamp
    await supabase
      .from("user_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("api_key", apiKey);

    // Get user settings for rate limiting and feature access
    const { data: userSettings } = await supabase
      .from("user_settings")
      .select("api_access_enabled")
      .eq("user_id", keyData.user_id)
      .single();

    if (!userSettings?.api_access_enabled) {
      return new Response(JSON.stringify({ error: "API access not enabled for this user" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return user information for the authenticated request
    return new Response(JSON.stringify({ 
      success: true,
      user_id: keyData.user_id,
      api_access_enabled: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("API authentication error:", error);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
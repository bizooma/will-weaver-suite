import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface WidgetRequestBody {
  chatbotId: string;
  origin?: string;
  sessionId?: string;
}

serve(async (req) => {
  console.log(`Widget config request: ${req.method} ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'GET') {
      // Get chatbot ID from URL params
      const url = new URL(req.url);
      const chatbotId = url.searchParams.get('chatbotId');
      
      if (!chatbotId) {
        return new Response(
          JSON.stringify({ error: 'chatbotId parameter is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Log widget request for analytics
      const origin = req.headers.get('origin');
      const userAgent = req.headers.get('user-agent');
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

      await supabase.from('widget_requests').insert({
        chatbot_id: chatbotId,
        origin_domain: origin,
        ip_address: clientIP,
        user_agent: userAgent,
        session_id: crypto.randomUUID(),
      });

      // Get chatbot configuration using secure function
      const { data: config, error } = await supabase.rpc('get_chatbot_widget_config', {
        chatbot_id_param: chatbotId
      });

      if (error) {
        console.error('Error fetching chatbot config:', error);
        return new Response(
          JSON.stringify({ error: 'Chatbot not found or inactive' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: config }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (req.method === 'POST') {
      // Handle widget load logging — only log to widget_requests, NOT chatbot_conversations.
      // Creating a conversation record here caused empty rows flooding the dashboard.
      const body: WidgetRequestBody = await req.json();
      const { chatbotId, origin, sessionId } = body;

      if (!chatbotId) {
        return new Response(
          JSON.stringify({ error: 'chatbotId is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Log page load to widget_requests analytics table only
      const generatedSessionId = sessionId || crypto.randomUUID();
      const userAgent = req.headers.get('user-agent');
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

      const { error: logError } = await supabase.from('widget_requests').insert({
        chatbot_id: chatbotId,
        origin_domain: origin,
        ip_address: clientIP,
        user_agent: userAgent,
        session_id: generatedSessionId,
      });

      if (logError) {
        console.error('Error logging widget request:', logError);
      }

      return new Response(
        JSON.stringify({ success: true, sessionId: generatedSessionId }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Widget config error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
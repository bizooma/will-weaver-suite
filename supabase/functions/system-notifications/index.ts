import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header and verify user
    const authHeader = req.headers.get('authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (req.method === 'POST') {
      // Check if user has admin role for creating notifications
      const { data: hasAdminRole } = await supabase.rpc('has_role', { 
        _user_id: user.id, 
        _role: 'admin' 
      });

      if (!hasAdminRole) {
        return new Response(JSON.stringify({ error: 'Admin access required' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const { title, message } = await req.json();

      // Create system notification
      const { data: notification, error } = await supabase
        .from('system_notifications')
        .insert({
          title,
          message,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return new Response(JSON.stringify({ error: 'Failed to create notification' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Get all users to create user_notifications entries
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id');

      if (profiles) {
        const userNotifications = profiles.map(profile => ({
          user_id: profile.user_id,
          notification_id: notification.id
        }));

        await supabase
          .from('user_notifications')
          .insert(userNotifications);
      }

      return new Response(JSON.stringify({ notification }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'GET') {
      // Get notifications for current user
      const { data: notifications, error } = await supabase
        .from('system_notifications')
        .select(`
          *,
          user_notifications!inner (
            read_at
          )
        `)
        .eq('user_notifications.user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ notifications }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.method === 'PATCH') {
      // Mark notification as read
      const { notificationId } = await req.json();

      const { error } = await supabase
        .from('user_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('notification_id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return new Response(JSON.stringify({ error: 'Failed to mark notification as read' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error in system-notifications function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
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

    // Get auth header and verify user is admin
    const authHeader = req.headers.get('authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Check if user has admin role
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

    const { action, userId, status, userData } = await req.json();

    if (action === 'updateStatus') {
      // Update user status (pause/activate/delete)
      const { error: updateError } = await supabase.rpc('admin_update_user_status', {
        _user_id: userId,
        _status: status
      });

      if (updateError) {
        console.error('Error updating user status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update user status' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'createUser') {
      // First create the database records with temporary user ID
      const { data: tempUserData, error: tempCreateError } = await supabase.rpc('admin_create_user_with_subscription', {
        _email: userData.email,
        _display_name: userData.displayName,
        _plan_type: userData.planType
      });

      if (tempCreateError) {
        console.error('Error creating temporary user records:', tempCreateError);
        return new Response(JSON.stringify({ error: 'Failed to create user records' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Create the actual auth user with the temporary password
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: tempUserData.temp_password,
        email_confirm: true,
        user_metadata: {
          display_name: userData.displayName
        }
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return new Response(JSON.stringify({ error: 'Failed to create user account' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Update the database records with the real auth user ID
      const { error: updateError } = await supabase.rpc('admin_update_created_user', {
        _temp_user_id: tempUserData.user_id,
        _auth_user_id: authUser.user.id
      });

      if (updateError) {
        console.error('Error updating user records with auth ID:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to finalize user creation' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ 
        user: {
          ...tempUserData,
          user_id: authUser.user.id,
          auth_created: true
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error in admin-manage-user function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
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
      // Create the actual auth user first so we have a valid user_id for FKs
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          display_name: userData.displayName
        }
      });

      if (authError || !authUser?.user) {
        console.error('Error creating auth user:', authError);
        return new Response(JSON.stringify({ error: 'Failed to create user account' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const newUserId = authUser.user.id;

      // Insert profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: newUserId,
        email: userData.email,
        display_name: userData.displayName,
        account_status: 'active'
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return new Response(JSON.stringify({ error: 'Failed to create user profile' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Insert subscription
      const { error: subscriptionError } = await supabase.from('user_subscriptions').insert({
        user_id: newUserId,
        plan_type: userData.planType,
        purchase_date: new Date().toISOString()
      });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return new Response(JSON.stringify({ error: 'Failed to create user subscription' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Assign appropriate role based on plan type
      const role = userData.planType === 'free' ? 'free' : 'user';
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: newUserId,
        role
      });

      if (roleError) {
        console.error('Error assigning role:', roleError);
        return new Response(JSON.stringify({ error: 'Failed to assign user role' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ 
        user: {
          user_id: newUserId,
          email: userData.email,
          display_name: userData.displayName,
          plan_type: userData.planType,
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
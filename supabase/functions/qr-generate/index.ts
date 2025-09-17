import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError || !user.user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { 
      name, 
      target_url, 
      slug, 
      qr_config = {} 
    } = await req.json()

    if (!name || !target_url || !slug) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders })
    }

    // Insert QR code record
    const { data: qrCode, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.user.id,
        name,
        target_url,
        slug,
        qr_config,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating QR code:', insertError)
      return new Response(
        JSON.stringify({ error: insertError.message }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate QR code URL for redirect
    const redirectUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/qr-redirect/${slug}`

    return new Response(
      JSON.stringify({ 
        qrCode: qrCode,
        redirectUrl: redirectUrl
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in qr-generate function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
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
    const url = new URL(req.url)
    const slug = url.pathname.split('/').pop()

    if (!slug) {
      return new Response('QR code not found', { status: 404 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get QR code details
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, target_url, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (qrError || !qrCode) {
      console.error('QR code not found:', qrError)
      return new Response('QR code not found', { status: 404 })
    }

    // Log the scan
    const clientIP = req.headers.get('cf-connecting-ip') || 
                     req.headers.get('x-forwarded-for') || 
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referrer = req.headers.get('referer') || null

    const { error: scanError } = await supabase
      .from('qr_scans')
      .insert({
        qr_code_id: qrCode.id,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer,
      })

    if (scanError) {
      console.error('Error logging scan:', scanError)
    }

    // Redirect to target URL
    return new Response(null, {
      status: 302,
      headers: {
        'Location': qrCode.target_url,
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('Error in qr-redirect function:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
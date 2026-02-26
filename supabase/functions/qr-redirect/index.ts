import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Attempt to geolocate an IP address using the free ip-api.com service.
 * Returns country, region, and city — or nulls on failure.
 */
async function geolocateIp(ip: string): Promise<{ country: string | null; region: string | null; city: string | null }> {
  const empty = { country: null, region: null, city: null }
  if (!ip || ip === 'unknown') return empty

  try {
    // ip-api.com is free for non-commercial use and requires no key
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(3000), // 3-second timeout so we don't block the redirect
    })
    if (!res.ok) return empty

    const data = await res.json()
    if (data.status !== 'success') return empty

    return {
      country: data.country || null,
      region: data.regionName || null,
      city: data.city || null,
    }
  } catch (err) {
    console.error('Geolocation lookup failed:', err)
    return empty
  }
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

    // Capture visitor metadata
    const clientIP = req.headers.get('cf-connecting-ip') ||
                     req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referrer = req.headers.get('referer') || null

    // Geolocate the IP to populate country / region / city
    const geo = await geolocateIp(clientIP)

    // Log the scan with geographic data
    const { error: scanError } = await supabase
      .from('qr_scans')
      .insert({
        qr_code_id: qrCode.id,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer,
        country: geo.country,
        region: geo.region,
        city: geo.city,
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

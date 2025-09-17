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

    const url = new URL(req.url)
    const qrCodeId = url.searchParams.get('qr_code_id')

    if (!qrCodeId) {
      return new Response('QR code ID required', { status: 400, headers: corsHeaders })
    }

    // Verify user owns this QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('id, name')
      .eq('id', qrCodeId)
      .eq('user_id', user.user.id)
      .single()

    if (qrError || !qrCode) {
      return new Response('QR code not found', { status: 404, headers: corsHeaders })
    }

    // Get scan analytics
    const { data: scans, error: scansError } = await supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false })

    if (scansError) {
      console.error('Error fetching scans:', scansError)
      return new Response('Error fetching analytics', { status: 500, headers: corsHeaders })
    }

    // Calculate analytics
    const totalScans = scans?.length || 0
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const scansToday = scans?.filter(scan => 
      new Date(scan.scanned_at) >= yesterday
    ).length || 0

    const scansLastWeek = scans?.filter(scan => 
      new Date(scan.scanned_at) >= lastWeek
    ).length || 0

    // Top countries
    const countries = scans?.reduce((acc, scan) => {
      if (scan.country) {
        acc[scan.country] = (acc[scan.country] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const topCountries = Object.entries(countries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }))

    // Hourly distribution for last 24 hours
    const hourlyScans = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date(today.getTime() - (23 - hour) * 60 * 60 * 1000)
      hourStart.setMinutes(0, 0, 0)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
      
      const count = scans?.filter(scan => {
        const scanTime = new Date(scan.scanned_at)
        return scanTime >= hourStart && scanTime < hourEnd
      }).length || 0

      return {
        hour: hourStart.getHours(),
        count
      }
    })

    const analytics = {
      qrCode,
      totalScans,
      scansToday,
      scansLastWeek,
      topCountries,
      hourlyScans,
      recentScans: scans?.slice(0, 10) || []
    }

    return new Response(
      JSON.stringify(analytics), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in qr-analytics function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
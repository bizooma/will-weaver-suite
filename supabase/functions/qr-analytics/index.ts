import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Parse a user-agent string into device type and browser name.
 * Lightweight parser — covers the most common UA patterns.
 */
function parseUserAgent(ua: string | null): { device: string; browser: string; os: string } {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }

  // --- Device type ---
  let device = 'Desktop'
  if (/tablet|ipad|playbook|silk/i.test(ua)) device = 'Tablet'
  else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) device = 'Mobile'

  // --- Browser ---
  let browser = 'Other'
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/crios/i.test(ua) || (/chrome/i.test(ua) && !/edg/i.test(ua))) browser = 'Chrome'
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/msie|trident/i.test(ua)) browser = 'IE'

  // --- OS ---
  let os = 'Other'
  if (/windows/i.test(ua)) os = 'Windows'
  else if (/macintosh|mac os/i.test(ua)) os = 'macOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/linux/i.test(ua)) os = 'Linux'

  return { device, browser, os }
}

/**
 * Build a frequency map from an array, counting occurrences of each value
 * returned by the `keyFn` callback.
 */
function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || 'Unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/** Convert a frequency map to a sorted array of { name, value } objects. */
function toSortedArray(map: Record<string, number>) {
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))
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
      { global: { headers: { Authorization: authHeader } } }
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

    // Fetch all scans for this QR code
    const { data: scans, error: scansError } = await supabase
      .from('qr_scans')
      .select('*')
      .eq('qr_code_id', qrCodeId)
      .order('scanned_at', { ascending: false })

    if (scansError) {
      console.error('Error fetching scans:', scansError)
      return new Response('Error fetching analytics', { status: 500, headers: corsHeaders })
    }

    const allScans = scans || []

    // ── Basic counts ──────────────────────────────────────────────
    const totalScans = allScans.length
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const scansToday = allScans.filter(s => new Date(s.scanned_at) >= yesterday).length
    const scansLastWeek = allScans.filter(s => new Date(s.scanned_at) >= lastWeek).length

    // ── Geographic breakdown ──────────────────────────────────────
    const topCountries = toSortedArray(countBy(allScans, s => s.country)).slice(0, 10)
    const topRegions = toSortedArray(countBy(allScans, s => s.region)).slice(0, 10)
    const topCities = toSortedArray(countBy(allScans, s => s.city)).slice(0, 10)

    // ── Device / Browser / OS breakdown ───────────────────────────
    const parsed = allScans.map(s => ({ ...s, ...parseUserAgent(s.user_agent) }))
    const deviceBreakdown = toSortedArray(countBy(parsed, s => s.device))
    const browserBreakdown = toSortedArray(countBy(parsed, s => s.browser))
    const osBreakdown = toSortedArray(countBy(parsed, s => s.os))

    // ── Referrer tracking ─────────────────────────────────────────
    const referrerBreakdown = toSortedArray(
      countBy(allScans, s => {
        if (!s.referrer) return 'Direct / None'
        try {
          return new URL(s.referrer).hostname
        } catch {
          return s.referrer
        }
      })
    ).slice(0, 10)

    // ── Unique vs repeat visitors (based on IP) ───────────────────
    const ipCounts: Record<string, number> = {}
    allScans.forEach(s => {
      const ip = String(s.ip_address || 'unknown')
      ipCounts[ip] = (ipCounts[ip] || 0) + 1
    })
    const uniqueVisitors = Object.keys(ipCounts).length
    const repeatVisitors = Object.values(ipCounts).filter(c => c > 1).length

    // ── Daily trend (last 30 days) ────────────────────────────────
    const dailyTrend: Array<{ date: string; scans: number; uniqueIps: number }> = []
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      const dateStr = day.toISOString().slice(0, 10) // YYYY-MM-DD

      const dayScans = allScans.filter(s => s.scanned_at?.slice(0, 10) === dateStr)
      const dayIps = new Set(dayScans.map(s => String(s.ip_address || 'unknown')))

      dailyTrend.push({ date: dateStr, scans: dayScans.length, uniqueIps: dayIps.size })
    }

    // ── Hourly distribution (last 24h) ────────────────────────────
    const hourlyScans = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date(now.getTime() - (23 - hour) * 60 * 60 * 1000)
      hourStart.setMinutes(0, 0, 0)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)

      const count = allScans.filter(s => {
        const t = new Date(s.scanned_at)
        return t >= hourStart && t < hourEnd
      }).length

      return { hour: hourStart.getHours(), count }
    })

    // ── Recent scans (enriched with parsed UA) ────────────────────
    const recentScans = parsed.slice(0, 20).map(s => ({
      scanned_at: s.scanned_at,
      country: s.country,
      region: s.region,
      city: s.city,
      device: s.device,
      browser: s.browser,
      os: s.os,
      referrer: s.referrer,
    }))

    // ── Assemble response ─────────────────────────────────────────
    const analytics = {
      qrCode,
      totalScans,
      scansToday,
      scansLastWeek,
      uniqueVisitors,
      repeatVisitors,
      topCountries,
      topRegions,
      topCities,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      referrerBreakdown,
      dailyTrend,
      hourlyScans,
      recentScans,
    }

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in qr-analytics function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

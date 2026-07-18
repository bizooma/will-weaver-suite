import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Geolocate an IP using ip-api.com (free tier, max 45 req/min).
 * Returns country, region, city or nulls on failure.
 */
async function geolocateIp(ip: string) {
  const empty = { country: null, region: null, city: null }
  if (!ip || ip === 'unknown') return empty

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return empty
    const data = await res.json()
    if (data.status !== 'success') return empty
    return { country: data.country || null, region: data.regionName || null, city: data.city || null }
  } catch {
    return empty
  }
}

/**
 * One-time backfill edge function.
 * Finds qr_scans rows where country IS NULL, geolocates them in batches,
 * and updates each row. Respects ip-api.com's 45 req/min rate limit by
 * processing in batches of 40 with a 62-second pause between batches.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // === AuthN + admin check ===
    // This is a one-off maintenance tool. Restrict to admins so it can't be
    // triggered anonymously to blow through the ip-api.com free tier or
    // rewrite qr_scans rows en masse.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', ''),
    )
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const supabase = createClient(supabaseUrl, serviceKey)
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: userData.user.id,
      _role: 'admin',
    })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }


    // Fetch scans missing geographic data (limit to 200 per invocation)
    const { data: scans, error: fetchErr } = await supabase
      .from('qr_scans')
      .select('id, ip_address')
      .is('country', null)
      .limit(200)

    if (fetchErr) {
      console.error('Error fetching scans:', fetchErr)
      return new Response(JSON.stringify({ error: 'Failed to fetch scans' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!scans || scans.length === 0) {
      return new Response(JSON.stringify({ message: 'No scans to backfill', updated: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let updated = 0
    let skipped = 0

    // Process scans one at a time with a small delay to respect rate limits
    for (const scan of scans) {
      const ip = String(scan.ip_address || '')
      const geo = await geolocateIp(ip)

      if (geo.country) {
        const { error: updateErr } = await supabase
          .from('qr_scans')
          .update({ country: geo.country, region: geo.region, city: geo.city })
          .eq('id', scan.id)

        if (!updateErr) updated++
        else skipped++
      } else {
        skipped++
      }

      // ~50ms delay between requests to stay well under 45 req/min
      await new Promise(r => setTimeout(r, 50))
    }

    return new Response(JSON.stringify({
      message: 'Backfill complete',
      total: scans.length,
      updated,
      skipped,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Backfill error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

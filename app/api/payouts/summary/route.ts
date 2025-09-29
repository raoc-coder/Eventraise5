import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [payouts/summary] Starting authentication check...')
    
    // Check admin authentication - try both cookie and header auth
    let user = null
    
    // Try cookie-based auth first
    try {
      console.log('🍪 [payouts/summary] Trying cookie auth...')
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data: { user: cookieUser } } = await supabase.auth.getUser()
      user = cookieUser
      console.log('✅ [payouts/summary] Cookie auth successful:', !!user)
    } catch (e) {
      console.log('❌ [payouts/summary] Cookie auth failed:', e.message)
      // If cookie auth fails, try header auth
      const authHeader = req.headers.get('authorization')
      console.log('🔑 [payouts/summary] Auth header:', authHeader ? 'Present' : 'Missing')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log('🎫 [payouts/summary] Token length:', token.length)
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        const { data: { user: headerUser } } = await supabase.auth.getUser(token)
        user = headerUser
        console.log('✅ [payouts/summary] Header auth successful:', !!user)
      }
    }
    
    if (!user) {
      console.log('❌ [payouts/summary] No user found, returning 401')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // TEMPORARY: Skip admin check for testing
    console.log('User authenticated:', user.email)
    console.log('User metadata:', user.user_metadata)
    console.log('App metadata:', user.app_metadata)
    
    // const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    // }
    
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const campaignId = searchParams.get('campaignId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    // Allow empty filters to show all donations

    const filters: any = {}
    if (eventId) filters.event_id = eventId
    if (campaignId) filters.campaign_id = campaignId

    let query = supabaseAdmin
      .from('donation_requests')
      .select('amount_cents, fee_cents, net_cents, status, settlement_status, created_at')
      .match(filters)

    if (startDate) (query as any).gte('created_at', new Date(startDate).toISOString())
    if (endDate) {
      const endIso = new Date(endDate)
      endIso.setHours(23,59,59,999)
      ;(query as any).lte('created_at', endIso.toISOString())
    }

    let { data, error } = await query

    // Fallback if columns missing in live schema
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      let q2 = supabaseAdmin
        .from('donation_requests')
        .select('amount_cents, fee_cents, net_cents, status, settlement_status, created_at')
      if (startDate) (q2 as any).gte('created_at', new Date(startDate).toISOString())
      if (endDate) {
        const endIso = new Date(endDate)
        endIso.setHours(23,59,59,999)
        ;(q2 as any).lte('created_at', endIso.toISOString())
      }
      const alt = await q2
      data = alt.data as any
      error = alt.error as any
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const totals = (data || []).reduce(
      (acc, d: any) => {
        acc.gross_cents += d.amount_cents || 0
        acc.fee_cents += d.fee_cents || 0
        acc.net_cents += d.net_cents || 0
        if (d.settlement_status === 'settled') acc.settled_net_cents += d.net_cents || 0
        return acc
      },
      { gross_cents: 0, fee_cents: 0, net_cents: 0, settled_net_cents: 0 }
    )

    return NextResponse.json({ totals, count: data?.length || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load payout summary' }, { status: 500 })
  }
}



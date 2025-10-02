import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [payouts/summary] Starting authentication check...')
    
    // Use standardized admin authentication
    const { user, db } = await requireAdminAuth(req)
    console.log('✅ [payouts/summary] Admin authentication successful:', user.email)
    
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



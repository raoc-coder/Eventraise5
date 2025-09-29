import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const campaignId = searchParams.get('campaignId')
    const status = searchParams.get('status') // completed|failed|pending
    const settlement = searchParams.get('settlement') // settled|pending|failed
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const query = supabaseAdmin
      .from('donation_requests')
      .select('id, amount_cents, fee_cents, net_cents, status, settlement_status, donor_name, donor_email, created_at, event_id, campaign_id, braintree_transaction_id')
      .order('created_at', { ascending: false })

    if (eventId) (query as any).eq('event_id', eventId)
    if (campaignId) (query as any).eq('campaign_id', campaignId)
    if (status) (query as any).eq('status', status)
    if (settlement) (query as any).eq('settlement_status', settlement)

    if (startDate) (query as any).gte('created_at', new Date(startDate).toISOString())
    if (endDate) {
      const endIso = new Date(endDate)
      endIso.setHours(23,59,59,999)
      ;(query as any).lte('created_at', endIso.toISOString())
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ donations: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch donations' }, { status: 500 })
  }
}



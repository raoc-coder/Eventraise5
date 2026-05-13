import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireOwnerAdmin } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [payouts/donations] Starting authentication check...')
    
    // Use standardized admin authentication
    const { user } = await requireOwnerAdmin(req)
    console.log('✅ [payouts/donations] Admin authentication successful:', user.email)
    
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const campaignId = searchParams.get('campaignId')
    const status = searchParams.get('status') // completed|failed|pending
    const settlement = searchParams.get('settlement') // settled|pending|failed
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const baseSelect =
      'id, amount_cents, fee_cents, net_cents, status, settlement_status, donor_name, donor_email, created_at, event_id, campaign_id, paypal_order_id, paypal_capture_id, personal_campaign_id'
    let query = supabaseAdmin
      .from('donation_requests')
      .select(baseSelect)
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

    let { data, error } = await query

    // Fallback if certain columns don't exist in live schema (42703: undefined_column)
    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      let q2 = supabaseAdmin
        .from('donation_requests')
        .select(
          'id, amount_cents, fee_cents, net_cents, status, settlement_status, donor_name, donor_email, created_at, event_id, campaign_id, paypal_order_id, paypal_capture_id',
        )
        .order('created_at', { ascending: false })
      if (eventId) (q2 as any).eq('event_id', eventId)
      if (campaignId) (q2 as any).eq('campaign_id', campaignId)
      if (status) (q2 as any).eq('status', status)
      if (settlement) (q2 as any).eq('settlement_status', settlement)
      if (startDate) (q2 as any).gte('created_at', new Date(startDate).toISOString())
      if (endDate) {
        const endIso = new Date(endDate)
        endIso.setHours(23, 59, 59, 999)
        ;(q2 as any).lte('created_at', endIso.toISOString())
      }
      let alt = await q2
      data = alt.data as any
      error = alt.error as any
    }

    if (error && ((error as any).code === '42703' || (error as any).code === 'PGRST204')) {
      let q3 = supabaseAdmin
        .from('donation_requests')
        .select(
          'id, amount_cents, fee_cents, net_cents, status, settlement_status, donor_name, donor_email, created_at, event_id, campaign_id',
        )
        .order('created_at', { ascending: false })
      if (eventId) (q3 as any).eq('event_id', eventId)
      if (campaignId) (q3 as any).eq('campaign_id', campaignId)
      if (status) (q3 as any).eq('status', status)
      if (settlement) (q3 as any).eq('settlement_status', settlement)
      if (startDate) (q3 as any).gte('created_at', new Date(startDate).toISOString())
      if (endDate) {
        const endIso = new Date(endDate)
        endIso.setHours(23, 59, 59, 999)
        ;(q3 as any).lte('created_at', endIso.toISOString())
      }
      const alt3 = await q3
      data = alt3.data as any
      error = alt3.error as any
    }
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ donations: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch donations' }, { status: 500 })
  }
}



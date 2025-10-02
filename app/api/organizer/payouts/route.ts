import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    // Use standardized authentication
    const { user, db } = await requireAuth(req)

    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    // Get payouts for this organizer
    const { data: payouts, error: payoutsError } = await supabaseAdmin
      .from('event_payouts')
      .select(`
        id,
        event_id,
        total_gross_cents,
        total_fees_cents,
        total_net_cents,
        payout_status,
        payout_method,
        payout_reference,
        payout_date,
        created_at,
        events!inner (
          id,
          title
        )
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })

    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError)
      return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
    }

    // Get donation counts for each payout
    const payoutIds = payouts.map(p => p.id)
    const { data: donationCounts, error: countsError } = await supabaseAdmin
      .from('payout_items')
      .select('payout_id')
      .in('payout_id', payoutIds)

    if (countsError) {
      console.error('Error fetching donation counts:', countsError)
      return NextResponse.json({ error: 'Failed to fetch donation counts' }, { status: 500 })
    }

    // Combine data
    const countMap = new Map()
    donationCounts.forEach(item => {
      countMap.set(item.payout_id, (countMap.get(item.payout_id) || 0) + 1)
    })

    const enrichedPayouts = payouts.map(payout => ({
      id: payout.id,
      event_id: payout.event_id,
      event_title: (payout.events as any).title,
      total_gross_cents: payout.total_gross_cents,
      total_fees_cents: payout.total_fees_cents,
      total_net_cents: payout.total_net_cents,
      payout_status: payout.payout_status,
      payout_method: payout.payout_method,
      payout_reference: payout.payout_reference,
      payout_date: payout.payout_date,
      created_at: payout.created_at,
      donation_count: countMap.get(payout.id) || 0
    }))

    // Calculate totals
    const totals = {
      total_gross: payouts.reduce((sum, p) => sum + p.total_gross_cents, 0),
      total_fees: payouts.reduce((sum, p) => sum + p.total_fees_cents, 0),
      total_net: payouts.reduce((sum, p) => sum + p.total_net_cents, 0),
      pending_payouts: payouts.filter(p => p.payout_status === 'pending').length,
      completed_payouts: payouts.filter(p => p.payout_status === 'completed').length
    }

    return NextResponse.json({
      payouts: enrichedPayouts,
      totals
    })
  } catch (e) {
    console.error('Error in organizer payouts:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

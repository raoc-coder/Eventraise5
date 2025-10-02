import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    // Use standardized admin authentication
    const { user, db } = await requireAdminAuth(req)

    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    // Get all event payouts with event and organizer details
    const { data: payouts, error: payoutsError } = await supabaseAdmin
      .from('event_payouts')
      .select(`
        id,
        event_id,
        organizer_id,
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
          title,
          organizer_id
        )
      `)
      .order('created_at', { ascending: false })

    if (payoutsError) {
      console.error('Error fetching payouts:', payoutsError)
      return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
    }

    // Get organizer details for each payout
    const organizerIds = [...new Set(payouts.map(p => p.organizer_id))]
    const { data: organizers, error: organizersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', organizerIds)

    if (organizersError) {
      console.error('Error fetching organizers:', organizersError)
      return NextResponse.json({ error: 'Failed to fetch organizers' }, { status: 500 })
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
    const organizerMap = new Map(organizers.map(o => [o.id, o]))
    const countMap = new Map()
    donationCounts.forEach(item => {
      countMap.set(item.payout_id, (countMap.get(item.payout_id) || 0) + 1)
    })

    const enrichedPayouts = payouts.map(payout => ({
      id: payout.id,
      event_id: payout.event_id,
      event_title: payout.events.title,
      organizer_id: payout.organizer_id,
      organizer_name: organizerMap.get(payout.organizer_id)?.full_name || 'Unknown',
      organizer_email: organizerMap.get(payout.organizer_id)?.email || 'Unknown',
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
    console.error('Error in admin payouts:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

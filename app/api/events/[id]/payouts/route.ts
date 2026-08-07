import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireEventAccess } from '@/lib/auth-utils'
import { resolvePlatformAdminAccess } from '@/lib/platform-admin'

/** Statuses organizers may set. Settlement completion is platform-admin only. */
const ORGANIZER_ALLOWED_STATUSES = new Set(['requested'])
const PLATFORM_COMPLETION_STATUSES = new Set(['processing', 'completed', 'failed', 'cancelled'])

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Use standardized authentication
    const { event } = await requireEventAccess(req, id)

    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    // Get payout summary for this specific event
    const { data: payout, error: payoutError } = await supabaseAdmin
      .from('event_payouts')
      .select(`
        id,
        total_gross_cents,
        total_fees_cents,
        total_net_cents,
        payout_status,
        payout_method,
        payout_reference,
        payout_date,
        created_at,
        payout_items (
          id,
          amount_cents,
          fee_cents,
          net_cents,
          donation_requests (
            id,
            donor_name,
            donor_email,
            created_at
          )
        )
      `)
      .eq('event_id', id)
      .order('created_at', { ascending: false })

    if (payoutError) {
      console.error('Error fetching payout:', payoutError)
      return NextResponse.json({ error: 'Failed to fetch payout data' }, { status: 500 })
    }

    // Get donation summary for this event
    const { data: donations, error: donationsError } = await supabaseAdmin
      .from('donation_requests')
      .select('amount_cents, fee_cents, net_cents, status, settlement_status, created_at')
      .eq('event_id', id)
      .eq('status', 'completed')

    if (donationsError) {
      console.error('Error fetching donations:', donationsError)
      return NextResponse.json({ error: 'Failed to fetch donation data' }, { status: 500 })
    }

    // Calculate totals
    const totals = donations.reduce((acc, donation) => {
      acc.gross_cents += donation.amount_cents || 0
      acc.fees_cents += donation.fee_cents || 0
      acc.net_cents += donation.net_cents || 0
      return acc
    }, { gross_cents: 0, fees_cents: 0, net_cents: 0 })

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        organizer_id: event.organizer_id
      },
      payout: payout?.[0] || null,
      totals,
      donation_count: donations.length
    })
  } catch (e) {
    console.error('Error in event payouts:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Use standardized authentication
    const { user } = await requireEventAccess(req, id)

    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    const body = await req.json().catch(() => ({}))
    const { action } = body
    const platform = await resolvePlatformAdminAccess(user)

    if (action === 'create_payout') {
      // Create a new payout for this event
      const { data: payoutId, error: createError } = await supabaseAdmin
        .rpc('create_event_payout', { event_uuid: id })

      if (createError) {
        console.error('Error creating payout:', createError)
        return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        payout_id: payoutId,
        message: 'Payout created successfully' 
      })
    }

    if (action === 'update_payout_status') {
      const { payout_id, status, method, reference, notes } = body
      
      if (!payout_id || !status) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const nextStatus = String(status)

      // Organizers may only request cashout; platform admins settle.
      if (PLATFORM_COMPLETION_STATUSES.has(nextStatus) && !platform.isPlatformAdmin) {
        return NextResponse.json(
          { error: 'Only platform admins can mark payouts processing/completed/failed' },
          { status: 403 },
        )
      }
      if (!platform.isPlatformAdmin && !ORGANIZER_ALLOWED_STATUSES.has(nextStatus)) {
        return NextResponse.json(
          { error: 'Organizers may only set payout status to requested' },
          { status: 403 },
        )
      }

      const updateData: any = { payout_status: nextStatus }
      if (method) updateData.payout_method = method
      if (reference) updateData.payout_reference = reference
      if (notes) updateData.payout_notes = notes
      if (nextStatus === 'completed') updateData.payout_date = new Date().toISOString()

      const { data, error: updateError } = await supabaseAdmin
        .from('event_payouts')
        .update(updateData)
        .eq('id', payout_id)
        .eq('event_id', id)
        .select('*')

      if (updateError) {
        console.error('Error updating payout:', updateError)
        return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        payout: data?.[0],
        message: 'Payout updated successfully' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error('Error in event payout action:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

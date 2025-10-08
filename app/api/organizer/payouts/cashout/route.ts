import { NextRequest, NextResponse } from 'next/server'
import { supabase as sharedSupabase, supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientKeyFromHeaders } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const key = getClientKeyFromHeaders(req.headers)
    if (!rateLimit(`cashout:${key}`, 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const { event_id, payout_id, method, contact_email, notes } = await req.json().catch(() => ({}))
    if (!event_id && !payout_id) {
      return NextResponse.json({ error: 'Missing event_id or payout_id' }, { status: 400 })
    }
    if (!method || !['paypal', 'venmo', 'ach'].includes(String(method).toLowerCase())) {
      return NextResponse.json({ error: 'Invalid or missing method (paypal|venmo|ach)' }, { status: 400 })
    }

    // Verify user session
    const supabase = sharedSupabase!
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Use admin client to bypass RLS for server-side write with ownership checks
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Find payout row by payout_id or by latest payout for event
    let targetPayout: any = null
    if (payout_id) {
      const { data, error } = await supabaseAdmin
        .from('event_payouts')
        .select('*')
        .eq('id', payout_id)
        .single()
      if (error || !data) {
        return NextResponse.json({ error: 'Payout not found' }, { status: 404 })
      }
      targetPayout = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('event_payouts')
        .select('*')
        .eq('event_id', event_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error || !data) {
        return NextResponse.json({ error: 'No payouts for event' }, { status: 404 })
      }
      targetPayout = data
    }

    // Verify organizer ownership of the event
    const { data: eventRow, error: evErr } = await supabaseAdmin
      .from('events')
      .select('id, organizer_id, created_by, end_date, title')
      .eq('id', targetPayout.event_id)
      .single()
    if (evErr || !eventRow) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const ownerId = eventRow.organizer_id || eventRow.created_by
    if (ownerId && ownerId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update payout status to requested and store method + contact
    const { error: upErr } = await supabaseAdmin
      .from('event_payouts')
      .update({
        payout_status: 'requested',
        payout_method: String(method).toLowerCase(),
        payout_reference: contact_email || null,
      })
      .eq('id', targetPayout.id)

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 400 })
    }

    try {
      await supabaseAdmin.from('cashout_requests').insert({
        event_id: targetPayout.event_id,
        payout_id: targetPayout.id,
        requested_by: userId,
        method: String(method).toLowerCase(),
        contact_email: contact_email || null,
        notes: notes || null,
        status: 'requested'
      })
    } catch {}

    console.log('[ADMIN] Cash-out requested', {
      eventId: targetPayout.event_id,
      eventTitle: eventRow?.title,
      payoutId: targetPayout.id,
      method: String(method).toLowerCase(),
      contact: contact_email || null,
      requestedBy: userId,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

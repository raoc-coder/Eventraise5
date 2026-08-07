import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Public RSVP registration only.
 * Paid tickets must go through PayPal checkout (/api/paypal/create-order + capture,
 * or /api/events/[id]/tickets/checkout) — never confirm tickets here unpaid.
 */
export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '')
    const email = String(body?.email || '')
    const quantity = Math.max(1, Math.min(20, Number(body?.quantity || 1)))
    const requestedType = String(body?.type || 'rsvp')

    if (requestedType === 'ticket') {
      return NextResponse.json(
        {
          error: 'Ticket registration requires payment. Use the ticket checkout flow.',
        },
        { status: 400 },
      )
    }

    if (!name && !email) {
      return NextResponse.json({ error: 'Name or email required' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    const { data: eventRow, error: evErr } = await (supabaseAdmin as any)
      .from('events')
      .select('id, is_published')
      .eq('id', id)
      .single()
    if (evErr || !eventRow) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Require published events for public RSVP
    if (eventRow && eventRow.is_published === false) {
      return NextResponse.json({ error: 'Event is not published' }, { status: 400 })
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('event_registrations')
      .insert({
        event_id: id,
        type: 'rsvp',
        quantity,
        name: name || null,
        email: email || null,
        status: 'confirmed',
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ registration: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBraintreeGateway } from '@/lib/braintree-server'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const { ticket_id, quantity, name, email } = body

    if (!ticket_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid ticket_id or quantity' }, { status: 400 })
    }

    // Fetch ticket details
    const { data: ticket, error: ticketErr } = await supabaseAdmin
      .from('event_tickets')
      .select('*, events!inner(id, title, is_published)')
      .eq('id', ticket_id)
      .eq('event_id', id)
      .single()

    if (ticketErr || !ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    // Check if event is published
    if (ticket.events?.is_published === false) {
      return NextResponse.json({ error: 'Event is not published' }, { status: 400 })
    }

    // Check availability
    if (ticket.quantity_total && (ticket.quantity_sold + quantity) > ticket.quantity_total) {
      return NextResponse.json({ error: 'Not enough tickets available' }, { status: 400 })
    }

    // Check sales window
    const now = new Date()
    if (ticket.sales_start_at && new Date(ticket.sales_start_at) > now) {
      return NextResponse.json({ error: 'Ticket sales not yet started' }, { status: 400 })
    }
    if (ticket.sales_end_at && new Date(ticket.sales_end_at) < now) {
      return NextResponse.json({ error: 'Ticket sales ended' }, { status: 400 })
    }

    // Calculate total
    const totalCents = ticket.price_cents * quantity
    const feeCents = Math.floor(totalCents * 0.0899) // 8.99% platform fee
    const netCents = totalCents - feeCents

    // Create registration record
    const { data: registration, error: regErr } = await supabaseAdmin
      .from('event_registrations')
      .insert({
        event_id: id,
        type: 'ticket',
        quantity,
        name: name || null,
        email: email || null,
        status: 'pending',
        participant_name: name || null,
        participant_email: email || null,
      })
      .select('*')
      .single()

    if (regErr) return NextResponse.json({ error: regErr.message }, { status: 400 })

    // Generate Braintree client token
    const gateway = await getBraintreeGateway()
    const { clientToken } = await gateway.clientToken.generate({})

    return NextResponse.json({
      registration_id: registration.id,
      client_token: clientToken,
      amount: totalCents / 100,
      fee_cents: feeCents,
      net_cents: netCents,
      ticket: {
        id: ticket.id,
        name: ticket.name,
        price_cents: ticket.price_cents,
        currency: ticket.currency,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

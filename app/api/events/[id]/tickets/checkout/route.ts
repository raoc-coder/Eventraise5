import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createDonationOrder } from '@/lib/paypal'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    
    console.log('[api/tickets/checkout] Starting checkout for event:', id)
    
    // Use regular client for public ticket purchases
    const { supabase } = await import('@/lib/supabase')
    const db = supabase
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    
    const body = await req.json().catch(() => ({}))
    const { ticket_id, quantity, name, email } = body
    
    console.log('[api/tickets/checkout] Request body:', { ticket_id, quantity, name, email })

    if (!ticket_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid ticket_id or quantity' }, { status: 400 })
    }

    // Fetch ticket details
    const { data: ticket, error: ticketErr } = await db
      .from('event_tickets')
      .select('*, events!inner(id, title, is_published)')
      .eq('id', ticket_id)
      .eq('event_id', id)
      .single()

    if (ticketErr || !ticket) {
      console.error('[api/tickets/checkout] Ticket fetch error:', ticketErr)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }
    
    console.log('[api/tickets/checkout] Ticket found:', { id: ticket.id, name: ticket.name, price_cents: ticket.price_cents })

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

    // Create registration record (use admin client to bypass RLS)
    if (!supabaseAdmin) {
      console.error('[api/tickets/checkout] Admin client unavailable')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

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

    if (regErr) {
      console.error('[api/tickets/checkout] Registration creation error:', regErr)
      return NextResponse.json({ error: regErr.message }, { status: 400 })
    }
    
    console.log('[api/tickets/checkout] Registration created:', registration.id)

    // Create PayPal order for ticket purchase (server-priced; name/email are metadata only)
    const totalAmount = totalCents / 100
    console.log('[api/tickets/checkout] Creating PayPal order for amount:', totalAmount)
    
    const currency = String(ticket.currency || 'USD')
    const paypalOrder = await createDonationOrder(
      id,
      totalAmount,
      currency,
      name || undefined,
      email || undefined,
    )

    if (!paypalOrder?.success) {
      console.error('[api/tickets/checkout] PayPal order creation failed:', paypalOrder?.error)
      return NextResponse.json({ error: paypalOrder?.error || 'Failed to create PayPal order' }, { status: 502 })
    }

    console.log('[api/tickets/checkout] PayPal order created:', paypalOrder.orderId)

    // Persist order so /tickets/process can reconcile capture → registration
    const { error: orderInsertError } = await supabaseAdmin.from('paypal_orders').insert({
      order_id: paypalOrder.orderId,
      event_id: id,
      amount_cents: totalCents,
      platform_fee_cents: feeCents,
      paypal_fee_cents: 0,
      net_amount_cents: netCents,
      status: 'pending',
      type: 'ticket',
      ticket_id: ticket.id,
      quantity,
      registration_id: registration.id,
    })
    if (orderInsertError) {
      // registration_id column may be absent in older schemas — retry without it
      const msg = (orderInsertError as { message?: string }).message ?? ''
      if (msg.includes('registration_id')) {
        await supabaseAdmin.from('paypal_orders').insert({
          order_id: paypalOrder.orderId,
          event_id: id,
          amount_cents: totalCents,
          platform_fee_cents: feeCents,
          paypal_fee_cents: 0,
          net_amount_cents: netCents,
          status: 'pending',
          type: 'ticket',
          ticket_id: ticket.id,
          quantity,
        })
      } else {
        console.error('[api/tickets/checkout] Failed to store paypal order:', orderInsertError)
      }
    }

    return NextResponse.json({
      success: true,
      orderId: paypalOrder.orderId,
      registration_id: registration.id,
      paypal_order_id: paypalOrder.orderId,
      amount: totalAmount,
      ticket: {
        id: ticket.id,
        name: ticket.name,
        price: ticket.price_cents / 100,
        quantity: quantity
      }
    })
  } catch (e) {
    console.error('[api/tickets/checkout] Unexpected error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

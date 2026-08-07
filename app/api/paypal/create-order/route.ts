import { NextRequest, NextResponse } from 'next/server'
import { createDonationOrder, calculatePlatformFee } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { loadActivePersonalCampaign } from '@/lib/p2p/personal-campaigns'
import { centsToDollars, dollarsToCents } from '@/lib/money/cents'

/** Soft upper bound for free-form donations (USD). Tickets use DB price. */
const MAX_DONATION_DOLLARS = 50_000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventId,
      amount: clientAmount,
      type,
      ticketId,
      quantity: rawQuantity,
      currency = 'USD',
      personalCampaignId,
    } = body
    const headerIdempotencyKey = req.headers.get('idempotency-key')?.trim()
    const quantity = Math.max(1, Math.min(100, Number(rawQuantity) || 1))

    if (!eventId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['donation', 'ticket'].includes(String(type))) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // Verify event exists
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 })
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, is_published')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.is_published === false) {
      return NextResponse.json({ error: 'Event is not published' }, { status: 400 })
    }

    // Server-authoritative amount: never trust client price for tickets.
    let amount: number
    let resolvedTicketId: string | null = ticketId || null

    if (type === 'ticket') {
      if (!ticketId) {
        return NextResponse.json({ error: 'ticketId required for ticket orders' }, { status: 400 })
      }
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from('event_tickets')
        .select('id, event_id, price_cents, quantity_total, quantity_sold, sales_start_at, sales_end_at')
        .eq('id', ticketId)
        .eq('event_id', eventId)
        .single()

      if (ticketError || !ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
      }

      const now = Date.now()
      if (ticket.sales_start_at && new Date(ticket.sales_start_at).getTime() > now) {
        return NextResponse.json({ error: 'Ticket sales have not started' }, { status: 400 })
      }
      if (ticket.sales_end_at && new Date(ticket.sales_end_at).getTime() < now) {
        return NextResponse.json({ error: 'Ticket sales have ended' }, { status: 400 })
      }
      if (
        ticket.quantity_total != null &&
        Number(ticket.quantity_sold || 0) + quantity > Number(ticket.quantity_total)
      ) {
        return NextResponse.json({ error: 'Not enough tickets available' }, { status: 400 })
      }

      const unitCents = Number(ticket.price_cents)
      if (!Number.isFinite(unitCents) || unitCents < 0) {
        return NextResponse.json({ error: 'Invalid ticket price' }, { status: 400 })
      }
      amount = centsToDollars(unitCents * quantity)
      resolvedTicketId = ticket.id
    } else {
      if (clientAmount == null || Number(clientAmount) <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
      try {
        const cents = dollarsToCents(Number(clientAmount))
        if (cents > MAX_DONATION_DOLLARS * 100) {
          return NextResponse.json(
            { error: `Donation amount exceeds maximum of $${MAX_DONATION_DOLLARS}` },
            { status: 400 },
          )
        }
        amount = centsToDollars(cents)
      } catch {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
    }

    // Attribute donation to a P2P personal campaign when present and valid
    // (ADR ref: Sprint 1.5). Failed attribution is silent — the donation
    // still posts to the event so the donor experience is preserved. We do
    // log so an unusually high drop rate is investigable.
    let attributedPersonalCampaignId: string | null = null
    if (type === 'donation' && personalCampaignId) {
      const pc = await loadActivePersonalCampaign(
        supabaseAdmin,
        personalCampaignId,
        eventId,
      )
      if (pc) {
        attributedPersonalCampaignId = pc.id
      } else {
        console.warn(
          '[paypal/create-order] dropping personalCampaignId attribution',
          { personalCampaignId, eventId },
        )
      }
    }

    // Calculate fees
    const fees = calculatePlatformFee(amount, currency)

    // Deterministic request id for upstream idempotency (PayPal-Request-Id).
    const requestFingerprint = [
      eventId,
      String(type),
      String(resolvedTicketId || 'none'),
      String(Math.round(Number(amount) * 100)),
      String(quantity),
      String(currency)
    ].join('_')
    const paypalRequestId = (headerIdempotencyKey || `create_${eventId}_${requestFingerprint}`).slice(0, 108)

    // Create PayPal order
    const orderResult = await createDonationOrder(eventId, amount, currency, undefined, undefined, paypalRequestId)

    if (!orderResult.success) {
      // Propagate a clearer error with 4xx when it's likely a request/config issue
      const message = orderResult.error || 'Failed to create PayPal order'
      const status = /\(4\d\d\)/.test(message) ? 400 : 500
      console.error('Create-order failure:', message)
      return NextResponse.json({ error: message }, { status })
    }

    // Store order details in database for tracking
    const paypalOrderInsert: Record<string, unknown> = {
      order_id: orderResult.orderId,
      event_id: eventId,
      amount_cents: Math.round(amount * 100),
      platform_fee_cents: Math.round(fees.platformFee * 100),
      paypal_fee_cents: Math.round(fees.paypalFee * 100),
      net_amount_cents: Math.round(fees.netAmount * 100),
      status: 'pending',
      type: type,
      ticket_id: resolvedTicketId,
      quantity,
    }
    if (attributedPersonalCampaignId) {
      paypalOrderInsert.personal_campaign_id = attributedPersonalCampaignId
    }

    let { error: dbError } = await supabaseAdmin
      .from('paypal_orders')
      .insert(paypalOrderInsert)

    // Graceful fallback when migration 022 has not yet been applied in this
    // environment: drop the new column from the insert and retry once.
    if (dbError && attributedPersonalCampaignId) {
      const msg = (dbError as { message?: string }).message ?? ''
      const code = (dbError as { code?: string }).code ?? ''
      if (
        code === 'PGRST204' ||
        code === '42703' ||
        msg.includes('personal_campaign_id')
      ) {
        delete paypalOrderInsert.personal_campaign_id
        ;({ error: dbError } = await supabaseAdmin
          .from('paypal_orders')
          .insert(paypalOrderInsert))
      }
    }

    if (dbError) {
      console.error('Failed to store PayPal order:', dbError)
      // Don't fail the request, just log the error
    }

    const response = NextResponse.json({
      orderId: orderResult.orderId,
      fees: fees
    })
    if (headerIdempotencyKey) {
      response.headers.set('Idempotency-Key', headerIdempotencyKey)
    }
    return response

  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

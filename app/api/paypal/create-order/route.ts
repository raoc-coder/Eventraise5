import { NextRequest, NextResponse } from 'next/server'
import { createDonationOrder, calculatePlatformFee } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { loadActivePersonalCampaign } from '@/lib/p2p/personal-campaigns'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventId,
      amount,
      type,
      ticketId,
      quantity,
      currency = 'USD',
      personalCampaignId,
    } = body
    const headerIdempotencyKey = req.headers.get('idempotency-key')?.trim()

    if (!eventId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
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
      String(ticketId || 'none'),
      String(Math.round(Number(amount) * 100)),
      String(quantity || 1),
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
      ticket_id: ticketId || null,
      quantity: quantity || 1,
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

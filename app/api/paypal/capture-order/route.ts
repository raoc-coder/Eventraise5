import { NextRequest, NextResponse } from 'next/server'
import { captureOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, eventId, type, ticketId } = body
    const headerIdempotencyKey = req.headers.get('idempotency-key')?.trim()

    if (!orderId || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 })
    }

    // Validate incoming capture request against the server-side order record.
    const { data: storedOrder, error: orderLookupError } = await supabaseAdmin
      .from('paypal_orders')
      .select('id, event_id, type, ticket_id, status')
      .eq('order_id', orderId)
      .single()

    if (orderLookupError || !storedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (storedOrder.event_id !== eventId || storedOrder.type !== type) {
      return NextResponse.json({ error: 'Order details mismatch' }, { status: 400 })
    }

    if ((storedOrder.ticket_id || null) !== (ticketId || null)) {
      return NextResponse.json({ error: 'Ticket mismatch' }, { status: 400 })
    }

    if (storedOrder.status === 'captured') {
      const alreadyResponse = NextResponse.json({
        success: true,
        already_processed: true
      })
      if (headerIdempotencyKey) {
        alreadyResponse.headers.set('Idempotency-Key', headerIdempotencyKey)
      }
      return alreadyResponse
    }

    if (storedOrder.status !== 'pending') {
      return NextResponse.json({ error: 'Order is not capturable' }, { status: 409 })
    }

    const captureRequestId = (headerIdempotencyKey || `capture_${orderId}`).slice(0, 108)

    // Capture PayPal order
    const captureResult = await captureOrder(orderId, captureRequestId)

    if (!captureResult.success) {
      return NextResponse.json({ error: captureResult.error }, { status: 500 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({ 
        status: 'captured',
        capture_id: captureResult.captureId,
        captured_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (updateError) {
      console.error('Failed to update PayPal order:', updateError)
    }

    // Handle different payment types
    if (type === 'donation') {
      // Create donation record
      const { data: orderData } = await supabaseAdmin
        .from('paypal_orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (orderData) {
        const { error: donationError } = await supabaseAdmin
          .from('donation_requests')
          .insert({
            event_id: eventId,
            amount_cents: orderData.amount_cents,
            fee_cents: orderData.platform_fee_cents,
            net_cents: orderData.net_amount_cents,
            status: 'succeeded',
            donor_name: null, // Will be filled from PayPal data
            donor_email: null, // Will be filled from PayPal data
            settlement_status: 'pending',
            paypal_order_id: storedOrder.id,
            paypal_capture_id: captureResult.captureId
          })

        if (donationError) {
          console.error('Failed to create donation record:', donationError)
        }
      }
    } else if (type === 'ticket' && ticketId) {
      // Create ticket purchase record
      const { data: orderData } = await supabaseAdmin
        .from('paypal_orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (orderData) {
        const { error: registrationError } = await supabaseAdmin
          .from('event_registrations')
          .insert({
            event_id: eventId,
            type: 'ticket',
            quantity: orderData.quantity,
            status: 'confirmed',
            fee_cents: orderData.platform_fee_cents,
            net_cents: orderData.net_amount_cents,
            paypal_order_id: storedOrder.id,
            paypal_capture_id: captureResult.captureId
          })

        if (registrationError) {
          console.error('Failed to create ticket registration:', registrationError)
        }

        // Update ticket sold count
        const { error: ticketError } = await supabaseAdmin
          .from('event_tickets')
          .update({ 
            quantity_sold: (orderData.event_tickets?.quantity_sold || 0) + orderData.quantity
          })
          .eq('id', ticketId)

        if (ticketError) {
          console.error('Failed to update ticket count:', ticketError)
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      captureId: captureResult.captureId,
      status: captureResult.status
    })
    if (headerIdempotencyKey) {
      response.headers.set('Idempotency-Key', headerIdempotencyKey)
    }
    return response

  } catch (error) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

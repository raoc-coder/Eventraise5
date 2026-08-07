import { NextRequest, NextResponse } from 'next/server'
import { captureOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { settlePaypalCapture } from '@/lib/paypal/settle-capture'

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
      .select('id, event_id, type, ticket_id, status, amount_cents')
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

    if (storedOrder.status === 'captured' || storedOrder.status === 'completed') {
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

    const captureResult = await captureOrder(orderId, captureRequestId)

    if (!captureResult.success || !captureResult.captureId) {
      return NextResponse.json({ error: captureResult.error || 'Capture failed' }, { status: 500 })
    }

    const settled = await settlePaypalCapture({
      orderId,
      captureId: captureResult.captureId,
      capturedAmount: captureResult.amount,
      source: 'capture-api',
    })

    if (!settled.ok) {
      return NextResponse.json(
        { error: settled.error },
        { status: settled.status || 500 },
      )
    }

    const response = NextResponse.json({
      success: true,
      captureId: captureResult.captureId,
      status: captureResult.status,
      already_processed: settled.already,
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

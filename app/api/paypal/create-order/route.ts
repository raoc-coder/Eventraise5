import { NextRequest, NextResponse } from 'next/server'
import { createDonationOrder, calculatePlatformFee } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, amount, type, ticketId, quantity } = body

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

    // Calculate fees
    const fees = calculatePlatformFee(amount)

    // Create PayPal order
    const orderResult = await createDonationOrder(eventId, amount)

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.error }, { status: 500 })
    }

    // Store order details in database for tracking
    const { error: dbError } = await supabaseAdmin
      .from('paypal_orders')
      .insert({
        order_id: orderResult.orderId,
        event_id: eventId,
        amount_cents: Math.round(amount * 100),
        platform_fee_cents: Math.round(fees.platformFee * 100),
        paypal_fee_cents: Math.round(fees.paypalFee * 100),
        net_amount_cents: Math.round(fees.netAmount * 100),
        status: 'pending',
        type: type,
        ticket_id: ticketId || null,
        quantity: quantity || 1
      })

    if (dbError) {
      console.error('Failed to store PayPal order:', dbError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      orderId: orderResult.orderId,
      fees: fees
    })

  } catch (error) {
    console.error('PayPal create order error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

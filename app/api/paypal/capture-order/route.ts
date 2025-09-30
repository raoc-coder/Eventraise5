import { NextRequest, NextResponse } from 'next/server'
import { captureOrder } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, eventId, type, ticketId } = body

    if (!orderId || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Capture PayPal order
    const captureResult = await captureOrder(orderId)

    if (!captureResult.success) {
      return NextResponse.json({ error: captureResult.error }, { status: 500 })
    }

    // Update order status in database
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 })
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
            donor_name: null, // Will be filled from PayPal data
            donor_email: null, // Will be filled from PayPal data
            status: 'completed',
            settlement_status: 'pending',
            paypal_order_id: orderId,
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
            paypal_order_id: orderId,
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

    return NextResponse.json({
      success: true,
      captureId: captureResult.captureId,
      status: captureResult.status
    })

  } catch (error) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

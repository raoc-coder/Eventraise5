import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'
import { settlePaypalCapture } from '@/lib/paypal/settle-capture'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headers = Object.fromEntries(req.headers.entries())
    
    // Verify webhook signature
    if (!(await verifyWebhookSignature(headers, body))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const eventType = webhookData.event_type

    console.log('PayPal webhook received:', eventType)

    // Handle different webhook events
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(webhookData)
        break
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentDenied(webhookData)
        break
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(webhookData)
        break
      
      default:
        console.log('Unhandled webhook event:', eventType)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

async function handlePaymentCompleted(webhookData: any) {
  try {
    const captureId = webhookData.resource?.id
    const orderId = webhookData.resource?.supplementary_data?.related_ids?.order_id
    const capturedAmount = webhookData.resource?.amount?.value

    if (!captureId || !orderId) {
      console.error('Missing capture ID or order ID in webhook')
      return
    }

    if (!supabaseAdmin) {
      console.error('Database client not initialized')
      return
    }

    const settled = await settlePaypalCapture({
      orderId,
      captureId,
      capturedAmount,
      source: 'webhook',
    })

    if (!settled.ok) {
      console.error('[webhook] settle failed', settled.error)
      return
    }

    // Auto-create a payout for the related event (idempotent at RPC level)
    try {
      const { data: orderForEvent } = await supabaseAdmin
        .from('paypal_orders')
        .select('event_id')
        .eq('order_id', orderId)
        .single()

      const eventId = orderForEvent?.event_id
      if (eventId) {
        const { data: ev } = await supabaseAdmin
          .from('events')
          .select('id, organizer_id, created_by')
          .eq('id', eventId)
          .single()
        if (ev && !ev.organizer_id && ev.created_by) {
          await supabaseAdmin
            .from('events')
            .update({ organizer_id: ev.created_by })
            .eq('id', eventId)
        }

        const { error: payoutError } = await supabaseAdmin
          .rpc('create_event_payout', { event_uuid: eventId })
        if (payoutError) {
          console.error('Failed to auto-create payout:', payoutError)
        }
      }
    } catch (e) {
      console.error('Auto-create payout error:', e)
    }

  } catch (error) {
    console.error('Error handling payment completed:', error)
  }
}

async function handlePaymentDenied(webhookData: any) {
  try {
    const orderId = webhookData.resource?.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.error('Missing order ID in webhook')
      return
    }

    if (!supabaseAdmin) {
      console.error('Database client not initialized')
      return
    }

    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({ 
        status: 'denied',
        denied_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Failed to update order status:', updateError)
    }

  } catch (error) {
    console.error('Error handling payment denied:', error)
  }
}

async function handlePaymentRefunded(webhookData: any) {
  try {
    const orderId = webhookData.resource?.supplementary_data?.related_ids?.order_id
    const captureId = webhookData.resource?.id

    if (!orderId && !captureId) {
      console.error('Missing order/capture ID in webhook')
      return
    }

    if (!supabaseAdmin) {
      console.error('Database client not initialized')
      return
    }

    if (orderId) {
      await supabaseAdmin
        .from('paypal_orders')
        .update({ 
          status: 'refunded',
          refunded_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
    }

    const { data: orderRow } = orderId
      ? await supabaseAdmin
          .from('paypal_orders')
          .select('id')
          .eq('order_id', orderId)
          .maybeSingle()
      : { data: null }

    if (orderRow?.id) {
      await supabaseAdmin
        .from('donation_requests')
        .update({ status: 'refunded' })
        .eq('paypal_order_id', orderRow.id)
    } else if (captureId) {
      await supabaseAdmin
        .from('donation_requests')
        .update({ status: 'refunded' })
        .eq('paypal_capture_id', captureId)
    }

  } catch (error) {
    console.error('Error handling payment refunded:', error)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paypal'
import { supabaseAdmin } from '@/lib/supabase'

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

    console.log('PayPal webhook received:', eventType, webhookData)

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

    if (!captureId || !orderId) {
      console.error('Missing capture ID or order ID in webhook')
      return
    }

    if (!supabaseAdmin) {
      console.error('Database client not initialized')
      return
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
    }

    // Update donation status if applicable
    const { error: donationError } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'completed',
        settlement_status: 'settled'
      })
      .eq('paypal_order_id', orderId)

    if (donationError) {
      console.error('Failed to update donation status:', donationError)
    }

    // Update registration status if applicable
    const { error: registrationError } = await supabaseAdmin
      .from('event_registrations')
      .update({ 
        status: 'confirmed'
      })
      .eq('paypal_order_id', orderId)

    if (registrationError) {
      console.error('Failed to update registration status:', registrationError)
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

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({ 
        status: 'denied',
        denied_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

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

    if (!orderId) {
      console.error('Missing order ID in webhook')
      return
    }

    if (!supabaseAdmin) {
      console.error('Database client not initialized')
      return
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('paypal_orders')
      .update({ 
        status: 'refunded',
        refunded_at: new Date().toISOString()
      })
      .eq('order_id', orderId)

    if (updateError) {
      console.error('Failed to update order status:', updateError)
    }

    // Update donation status
    const { error: donationError } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'refunded'
      })
      .eq('paypal_order_id', orderId)

    if (donationError) {
      console.error('Failed to update donation status:', donationError)
    }

  } catch (error) {
    console.error('Error handling payment refunded:', error)
  }
}

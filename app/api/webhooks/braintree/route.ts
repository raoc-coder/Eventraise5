import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBraintreeGateway } from '@/lib/braintree-server'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get('bt-signature')
    const payload = req.headers.get('bt-payload')

    if (!signature || !payload) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
    }

    // Verify webhook signature with Braintree
    const gateway = await getBraintreeGateway()
    const webhookNotification = gateway.webhookNotification.parse(signature, payload)

    console.log('Braintree webhook received:', {
      kind: webhookNotification.kind,
      timestamp: webhookNotification.timestamp
    })

    switch (webhookNotification.kind) {
      case 'transaction_settled':
        await handleTransactionSettled(webhookNotification)
        break
      
      case 'transaction_settlement_declined':
        await handleTransactionDeclined(webhookNotification)
        break
      
      case 'subscription_charged_successfully':
        await handleSubscriptionCharged(webhookNotification)
        break
      
      case 'subscription_charged_unsuccessfully':
        await handleSubscriptionFailed(webhookNotification)
        break
      
      default:
        console.log('Unhandled webhook type:', webhookNotification.kind)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}

async function handleTransactionSettled(notification: any) {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin not available')
      return
    }

    const transaction = notification.transaction
    
    // Update donation status in database
    const { error } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'completed',
        settlement_status: 'settled',
        braintree_transaction_id: transaction.id,
        updated_at: new Date().toISOString()
      })
      .eq('braintree_transaction_id', transaction.id)

    if (error) {
      console.error('Failed to update donation status:', error)
    } else {
      console.log('Donation status updated to completed:', transaction.id)
    }
  } catch (error) {
    console.error('Error handling transaction settled:', error)
  }
}

async function handleTransactionDeclined(notification: any) {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin not available')
      return
    }

    const transaction = notification.transaction
    
    // Update donation status in database
    const { error } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'failed',
        braintree_transaction_id: transaction.id,
        updated_at: new Date().toISOString()
      })
      .eq('braintree_transaction_id', transaction.id)

    if (error) {
      console.error('Failed to update donation status:', error)
    } else {
      console.log('Donation status updated to failed:', transaction.id)
    }
  } catch (error) {
    console.error('Error handling transaction declined:', error)
  }
}

async function handleSubscriptionCharged(notification: any) {
  // Handle subscription payments if needed
  console.log('Subscription charged successfully:', notification.subscription.id)
}

async function handleSubscriptionFailed(notification: any) {
  // Handle failed subscription payments if needed
  console.log('Subscription charge failed:', notification.subscription.id)
}
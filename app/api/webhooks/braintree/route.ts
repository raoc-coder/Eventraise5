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
        console.log('Unhandled webhook kind:', webhookNotification.kind)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Braintree webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleTransactionSettled(notification: any) {
  const transaction = notification.transaction
  
  try {
    if (!supabaseAdmin) {
      console.error('Database unavailable for transaction settled')
      return
    }

    // Update donation status to completed
    const { error } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'completed',
        braintree_transaction_id: transaction.id,
        settled_at: new Date().toISOString()
      })
      .eq('payment_intent_id', transaction.id)

    if (error) {
      console.error('Failed to update donation status:', error)
    } else {
      console.log('Donation marked as completed:', transaction.id)
    }
  } catch (error) {
    console.error('Error handling transaction settled:', error)
  }
}

async function handleTransactionDeclined(notification: any) {
  const transaction = notification.transaction
  
  try {
    if (!supabaseAdmin) {
      console.error('Database unavailable for transaction declined')
      return
    }

    // Update donation status to failed
    const { error } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'failed',
        braintree_transaction_id: transaction.id,
        failure_reason: transaction.processorResponseText || 'Transaction declined'
      })
      .eq('payment_intent_id', transaction.id)

    if (error) {
      console.error('Failed to update donation status:', error)
    } else {
      console.log('Donation marked as failed:', transaction.id)
    }
  } catch (error) {
    console.error('Error handling transaction declined:', error)
  }
}

async function handleSubscriptionCharged(notification: any) {
  const subscription = notification.subscription
  
  try {
    // Handle successful subscription charge
    console.log('Subscription charged successfully:', subscription.id)
    // Add your subscription logic here
  } catch (error) {
    console.error('Error handling subscription charged:', error)
  }
}

async function handleSubscriptionFailed(notification: any) {
  const subscription = notification.subscription
  
  try {
    // Handle failed subscription charge
    console.log('Subscription charge failed:', subscription.id)
    // Add your subscription failure logic here
  } catch (error) {
    console.error('Error handling subscription failed:', error)
  }
}
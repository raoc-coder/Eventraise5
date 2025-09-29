import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBraintreeGateway } from '@/lib/braintree-server'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    // Braintree sends application/x-www-form-urlencoded body with bt_signature & bt_payload
    const raw = await req.text()
    const params = new URLSearchParams(raw)
    const signature = params.get('bt_signature')
    const payload = params.get('bt_payload')

    if (!signature || !payload) {
      return NextResponse.json({ error: 'Missing bt_signature/bt_payload' }, { status: 400 })
    }

    const gateway = await getBraintreeGateway()
    const webhookNotification = await (gateway as any).webhookNotification.parse(signature, payload)

    console.log('[webhooks/braintree] received', {
      kind: webhookNotification?.kind,
      timestamp: webhookNotification?.timestamp
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
        console.log('[webhooks/braintree] unhandled kind', webhookNotification.kind)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhooks/braintree] error', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
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
    // Try update by braintree_transaction_id; if none updated, attempt by payment_intent_id (legacy)
    let { error } = await supabaseAdmin
      .from('donation_requests')
      .update({ 
        status: 'succeeded',
        settlement_status: 'settled',
        braintree_transaction_id: transaction.id,
        updated_at: new Date().toISOString()
      })
      .eq('braintree_transaction_id', transaction.id)

    if (error) {
      console.error('[webhooks/braintree] update error by bt id', error)
    } else {
      // If no rows updated, try payment_intent_id
      const { error: err2 } = await supabaseAdmin
        .from('donation_requests')
        .update({ 
          status: 'succeeded',
          settlement_status: 'settled',
          braintree_transaction_id: transaction.id,
          updated_at: new Date().toISOString()
        })
        .eq('payment_intent_id', transaction.id)
      if (err2) console.error('[webhooks/braintree] update error by payment_intent_id', err2)
    }

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
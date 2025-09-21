import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    console.error('No Stripe signature found')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Security: Verify webhook signature to prevent unauthorized requests
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    // Security: Log webhook events for audit trail
    console.log(`Received verified webhook: ${event.type} (${event.id})`)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    if (!supabase) {
      console.error('Database not configured')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)

  if (!supabase) {
    console.error('Database not configured')
    return
  }

  const campaignId = session.metadata?.campaign_id
  const profileId = session.metadata?.profile_id
  const donorName = session.metadata?.donor_name || session.customer_details?.name || 'Anonymous'
  const donorEmail = session.metadata?.donor_email || session.customer_details?.email || ''

  if (!campaignId) {
    console.error('No campaign_id in session metadata')
    return
  }

  const amount = session.amount_total ? session.amount_total / 100 : 0

  try {
    // Use a database transaction to ensure data consistency
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaignId,
        profile_id: profileId,
        amount,
        donor_name: donorName,
        donor_email: donorEmail,
        payment_intent_id: session.payment_intent as string,
        checkout_session_id: session.id,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (donationError) {
      console.error('Error creating donation record:', donationError)
      throw donationError
    }

    // Update campaign raised amount using a database function
    const { error: updateError } = await supabase.rpc('increment_campaign_amount', {
      campaign_id: campaignId,
      amount: amount
    })

    if (updateError) {
      console.error('Error updating campaign amount:', updateError)
      throw updateError
    }

    console.log('Successfully processed donation:', {
      donationId: donation.id,
      campaignId,
      amount,
      donorName
    })

  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
    throw error
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)
  
  if (!supabase) {
    console.error('Database not configured')
    return
  }
  
  // Update donation status if it exists
  const { error } = await supabase
    .from('donations')
    .update({ status: 'completed' })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating donation status:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  
  if (!supabase) {
    console.error('Database not configured')
    return
  }
  
  // Update donation status to failed
  const { error } = await supabase
    .from('donations')
    .update({ status: 'failed' })
    .eq('payment_intent_id', paymentIntent.id)

  if (error) {
    console.error('Error updating donation status:', error)
  }
}

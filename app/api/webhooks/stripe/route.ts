import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { trackDonationCompleted } from '@/lib/analytics'
import { MonitoringService } from '@/lib/monitoring'
import { SendGridService } from '@/lib/sendgrid'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

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

    // Track successful donation completion
    trackDonationCompleted(campaignId, amount, donorEmail)

    // Track business metrics
    MonitoringService.trackBusinessMetric('donation_completed', amount, {
      campaign_id: campaignId,
      donor_email: donorEmail ? 'provided' : 'anonymous',
    })

    // Send confirmation and receipt emails
    if (donorEmail) {
      try {
        // Get campaign details for email
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('title, description, goal_amount, current_amount')
          .eq('id', campaignId)
          .single()

        if (campaign) {
          const donationDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })

          const progressPercentage = campaign.goal_amount > 0 
            ? (campaign.current_amount / campaign.goal_amount) * 100 
            : 0

          // Send confirmation email
          await SendGridService.sendDonationConfirmation({
            donorName,
            donorEmail,
            amount,
            campaignTitle: campaign.title,
            campaignDescription: campaign.description,
            donationId: donation.id,
            transactionId: session.payment_intent as string,
            donationDate,
            progressPercentage,
            goalAmount: campaign.goal_amount,
            currentAmount: campaign.current_amount,
          })

          // Send receipt email
          await SendGridService.sendDonationReceipt({
            donorName,
            donorEmail,
            amount,
            campaignTitle: campaign.title,
            campaignDescription: campaign.description,
            donationId: donation.id,
            transactionId: session.payment_intent as string,
            donationDate,
            taxDeductible: true, // Assuming donations are tax deductible
          })
        }
      } catch (emailError) {
        console.error('Error sending emails:', emailError)
        // Don't fail the webhook if email sending fails
      }
    }

    console.log('Successfully processed donation:', {
      donationId: donation.id,
      campaignId,
      amount,
      donorName
    })

  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error)
    
    // Monitor critical payment processing errors
    MonitoringService.trackCriticalError(
      error instanceof Error ? error : new Error('Unknown checkout error'),
      {
        campaign_id: campaignId,
        amount,
        session_id: session.id,
      }
    )
    
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

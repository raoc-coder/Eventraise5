import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, eventId, donorInfo, paymentMethodId } = await request.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`,
      metadata: {
        eventId,
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        isAnonymous: donorInfo.isAnonymous.toString(),
      },
    })

    // Save donation to database
    const { error } = await supabaseAdmin
      .from('donations')
      .insert({
        event_id: eventId,
        amount: amount / 100, // Convert back to dollars
        currency: currency.toUpperCase(),
        status: 'completed',
        payment_intent_id: paymentIntent.id,
        donor_name: donorInfo.isAnonymous ? null : donorInfo.name,
        donor_email: donorInfo.isAnonymous ? null : donorInfo.email,
        is_anonymous: donorInfo.isAnonymous,
        message: donorInfo.message || null,
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save donation' }, { status: 500 })
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}

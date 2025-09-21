import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { getAppUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, eventId, donorInfo, paymentMethodId } = await request.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${getAppUrl()}/events/${eventId}`,
      metadata: {
        eventId,
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        isAnonymous: donorInfo.isAnonymous.toString(),
      },
    })

    // Save donation to database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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

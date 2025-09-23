import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })

    const { amount, currency = 'usd', donor_name, donor_email, message } = await req.json()

    const amountCents = Math.round(Number(amount) * 100)
    if (!amountCents || amountCents < 100) {
      return NextResponse.json({ error: 'Minimum donation is $1' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
    })

    // NOTE: user_id should be taken from auth; as a placeholder, this endpoint trusts edge auth proxy
    const userId = req.headers.get('x-user-id') || null

    const { data, error } = await supabaseAdmin
      .from('donation_requests')
      .insert({
        user_id: userId,
        amount_cents: amountCents,
        currency,
        status: 'pending',
        payment_intent_id: paymentIntent.id,
        donor_name,
        donor_email,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to persist donation request', error)
      return NextResponse.json({ error: 'Failed to persist donation' }, { status: 500 })
    }

    return NextResponse.json({ client_secret: paymentIntent.client_secret, id: data.id })
  } catch (e) {
    console.error('create-intent error', e)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}



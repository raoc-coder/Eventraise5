import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAppUrl } from '@/lib/config'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    // Rate limiting
    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`bt-checkout:${clientKey}`, 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { 
      amount, 
      campaign_id, 
      profile_id, 
      donor_name, 
      donor_email,
      success_url,
      cancel_url,
      client_token
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const amountNum = parseFloat(amount)
    const amountCents = Math.round(amountNum * 100)
    const userId = req.headers.get('x-user-id') || null

    // Store donation request
    const { data: donationRequest, error: drError } = await supabaseAdmin
      .from('donation_requests')
      .insert({
        user_id: userId,
        amount_cents: amountCents,
        currency: 'usd',
        status: 'pending',
        donor_name,
        donor_email,
        campaign_id: campaign_id,
        profile_id: profile_id
      })
      .select()
      .single()

    if (drError) {
      console.error('Failed to create donation request:', drError)
      return NextResponse.json({ 
        error: 'Failed to create donation request' 
      }, { status: 500 })
    }

    const appUrl = getAppUrl()

    // For Braintree, we'll return the client token and donation request ID
    // The frontend will handle the payment flow with Drop-in UI
    return NextResponse.json({
      success: true,
      donationRequestId: donationRequest.id,
      clientToken: client_token,
      amount: amountNum,
      currency: 'usd',
      // Alternative: redirect to a hosted payment page if you prefer
      // checkoutUrl: `${appUrl}/payment/braintree?request_id=${donationRequest.id}&token=${client_token}`
    })

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 })
  }
}
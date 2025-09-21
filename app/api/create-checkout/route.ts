import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      campaign_id, 
      profile_id, 
      donor_name, 
      donor_email,
      currency = 'usd',
      success_url,
      cancel_url 
    } = await request.json()

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    // Get campaign details
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('title, description, goal_amount, current_amount')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Donation to ${campaign.title}`,
              description: campaign.description || 'Thank you for your generous donation!',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata: {
        campaign_id,
        profile_id: profile_id || '',
        donor_name: donor_name || '',
        donor_email: donor_email || '',
      },
      customer_email: donor_email,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

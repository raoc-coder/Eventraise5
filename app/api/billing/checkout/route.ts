import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAppUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const { plan, interval, trial } = await request.json()

    if (plan !== 'pro') {
      return NextResponse.json({ error: 'Unsupported plan' }, { status: 400 })
    }

    // Determine price ID by billing interval
    const isAnnual = interval === 'annual'
    const priceId = isAnnual ? process.env.STRIPE_PRICE_PRO_ANNUAL : process.env.STRIPE_PRICE_PRO
    if (!priceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
    }

    const appUrl = getAppUrl()

    const trialDaysEnv = parseInt(process.env.STRIPE_TRIAL_DAYS || '0', 10)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?billing=success`,
      cancel_url: `${appUrl}/pricing?billing=cancelled`,
      allow_promotion_codes: true,
      subscription_data: trial && trialDaysEnv > 0 ? { trial_period_days: trialDaysEnv } : undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Billing checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}



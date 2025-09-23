import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getAppUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    let payload: any = {}
    try {
      payload = await request.json()
    } catch {}
    const { plan, interval, trial } = payload

    console.log('[billing/checkout] incoming', {
      plan,
      interval,
      trial: !!trial,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    })

    if (plan !== 'pro') {
      return NextResponse.json({ error: 'Unsupported plan' }, { status: 400 })
    }

    // Determine price ID by billing interval
    const isAnnual = interval === 'annual'
    const priceId = isAnnual ? process.env.STRIPE_PRICE_PRO_ANNUAL : process.env.STRIPE_PRICE_PRO
    if (!priceId) {
      console.error('[billing/checkout] Missing Stripe price ID', {
        isAnnual,
        STRIPE_PRICE_PRO: !!process.env.STRIPE_PRICE_PRO,
        STRIPE_PRICE_PRO_ANNUAL: !!process.env.STRIPE_PRICE_PRO_ANNUAL,
      })
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
    }

    const appUrl = getAppUrl()
    console.log('[billing/checkout] config', { appUrl })

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

    console.log('[billing/checkout] session created', { id: session.id })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[billing/checkout] error', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}



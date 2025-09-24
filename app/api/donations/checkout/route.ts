import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { getAppUrl } from '@/lib/config'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    const body = await req.json().catch(() => ({}))
    const amount = Number(body?.amount)
    const eventId = (body?.eventId as string) || null
    const donor_name = body?.donor_name as string | undefined
    const donor_email = body?.donor_email as string | undefined
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[donations/checkout] Missing STRIPE_SECRET_KEY')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const amountCents = Math.round(amount * 100)
    const feeCents = Math.floor(amountCents * 0.0899)

    const userId = req.headers.get('x-user-id') || null
    const baseInsert: any = {
      user_id: userId,
      amount_cents: amountCents,
      currency: 'usd',
      status: 'pending',
      donor_name,
      donor_email,
    }
    if (eventId) baseInsert.event_id = eventId

    let { data: dr, error: drErr } = await supabaseAdmin
      .from('donation_requests')
      .insert(baseInsert)
      .select()
      .single()
    if (drErr) {
      const msg = (drErr as any).message || ''
      const code = (drErr as any).code || ''
      if (code === 'PGRST204' || code === '42703' || msg.includes('event_id')) {
        // Retry without event_id on schema variants
        delete baseInsert.event_id
        ;({ data: dr, error: drErr } = await supabaseAdmin
          .from('donation_requests')
          .insert(baseInsert)
          .select()
          .single())
      }
    }
    if (drErr) {
      console.error('[donations/checkout] Persist error', drErr)
      return NextResponse.json({ error: 'Failed to persist donation' }, { status: 500 })
    }

    const appUrl = getAppUrl()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Donation' },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
      cancel_url: `${appUrl}/events`,
      metadata: {
        donation_request_id: dr.id,
        platform_fee_cents: String(feeCents),
        event_id: eventId || '',
      },
    })

    // store session id on request for later reconciliation
    await supabaseAdmin
      .from('donation_requests')
      .update({ checkout_session_id: session.id })
      .eq('id', dr.id)

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('[donations/checkout] Error', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Failed to start checkout' }, { status: 500 })
  }
}



import { NextRequest, NextResponse } from 'next/server'
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

    // Check if Braintree is configured
    if (!process.env.BRAINTREE_MERCHANT_ID) {
      console.error('[donations/checkout] Missing BRAINTREE_MERCHANT_ID')
      return NextResponse.json({ error: 'Braintree not configured' }, { status: 500 })
    }

    const amountCents = Math.round(amount * 100)
    const feeCents = Math.floor(amountCents * 0.0899)
    const netCents = amountCents - feeCents

    const userId = req.headers.get('x-user-id') || null
    const baseInsert: any = {
      user_id: userId,
      amount_cents: amountCents,
      currency: 'usd',
      status: 'pending',
      donor_name,
      donor_email,
      fee_cents: feeCents,
      net_cents: netCents,
      settlement_status: 'pending'
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
      if (drErr) {
        // Retry without new columns (fee/net/settlement) for older schemas
        const colErr = (drErr as any).message || ''
        if (code === 'PGRST204' || code === '42703' || colErr.includes('fee_cents') || colErr.includes('net_cents') || colErr.includes('settlement_status')) {
          delete (baseInsert as any).fee_cents
          delete (baseInsert as any).net_cents
          delete (baseInsert as any).settlement_status
          ;({ data: dr, error: drErr } = await supabaseAdmin
            .from('donation_requests')
            .insert(baseInsert)
            .select()
            .single())
        }
      }
    }
    if (drErr) {
      console.error('[donations/checkout] Persist error', drErr)
      return NextResponse.json({ error: 'Failed to persist donation' }, { status: 500 })
    }

    const appUrl = getAppUrl()
    
    // For Braintree, we'll redirect to the Braintree payment page
    const eventQuery = eventId ? `&eventId=${encodeURIComponent(eventId)}` : ''
    const braintreeUrl = `${appUrl}/payment/braintree?request_id=${dr.id}&amount=${amount}${eventQuery}`
    
    return NextResponse.json({ url: braintreeUrl })
  } catch (e: any) {
    console.error('[donations/checkout] Error', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Failed to start checkout' }, { status: 500 })
  }
}



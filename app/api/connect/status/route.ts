import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  try {
    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('account_id')
    if (!accountId) return NextResponse.json({ error: 'account_id required' }, { status: 400 })

    const account = await stripe.accounts.retrieve(accountId)
    return NextResponse.json({
      id: account.id,
      type: account.type,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements?.currently_due || [],
    })
  } catch (e: any) {
    console.error('connect status error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to fetch account status' }, { status: 500 })
  }
}



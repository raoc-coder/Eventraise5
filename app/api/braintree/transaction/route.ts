import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    // Rate limiting
    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`bt-transaction:${clientKey}`, 5)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { 
      amount, 
      paymentMethodNonce, 
      paymentMethodType,
      eventId,
      campaignId,
      donorInfo 
    } = body

    if (!amount || !paymentMethodNonce) {
      return NextResponse.json({ 
        error: 'Missing required payment information' 
      }, { status: 400 })
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ 
        error: 'Invalid amount' 
      }, { status: 400 })
    }

    // Braintree is temporarily disabled
    return NextResponse.json({ 
      error: 'Payment system temporarily unavailable' 
    }, { status: 503 })

  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json({ 
      error: 'Transaction failed' 
    }, { status: 500 })
  }
}
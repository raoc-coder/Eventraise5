import { NextRequest, NextResponse } from 'next/server'
import { createTransaction } from '@/lib/braintree-server'
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

    // Create transaction with Braintree
    const result = await createTransaction(amount, paymentMethodNonce, {
      submitForSettlement: true
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: result.errors || 'Transaction failed',
        success: false 
      }, { status: 400 })
    }

    const transaction = result.transaction
    const userId = req.headers.get('x-user-id') || null

    // Calculate fee and net (8.99%)
    const amountCents = Math.round(amountNum * 100)
    const feeCents = Math.floor(amountCents * 0.0899)
    const netCents = amountCents - feeCents

    // Store donation in database
    const baseInsert: any = {
      user_id: userId,
      amount_cents: amountCents,
      currency: 'usd',
      status: 'completed',
      payment_intent_id: transaction.id,
      donor_name: donorInfo?.name,
      donor_email: donorInfo?.email,
      message: donorInfo?.message,
      event_id: eventId,
      campaign_id: campaignId,
      transaction_id: transaction.id,
      payment_method: paymentMethodType || 'card',
      braintree_transaction_id: transaction.id,
      fee_cents: feeCents,
      net_cents: netCents,
      settlement_status: 'pending'
    }

    let { data, error } = await supabaseAdmin
      .from('donation_requests')
      .insert(baseInsert)
      .select()
      .single()

    if (error) {
      const code = (error as any).code || ''
      const msg = (error as any).message || ''
      if (code === 'PGRST204' || code === '42703' || msg.includes('event_id')) {
        delete baseInsert.event_id
        ;({ data, error } = await supabaseAdmin
          .from('donation_requests')
          .insert(baseInsert)
          .select()
          .single())
      }
      if (error && (code === 'PGRST204' || code === '42703' || msg.includes('fee_cents') || msg.includes('net_cents') || msg.includes('settlement_status'))) {
        // Retry without new columns for older schemas
        delete baseInsert.fee_cents
        delete baseInsert.net_cents
        delete baseInsert.settlement_status
        ;({ data, error } = await supabaseAdmin
          .from('donation_requests')
          .insert(baseInsert)
          .select()
          .single())
      }
    }

    if (error) {
      console.error('Failed to store donation:', error)
      return NextResponse.json({ 
        error: 'Payment processed but failed to record donation',
        transaction: transaction,
        success: false 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction: transaction,
      donation: data
    })

  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json({ 
      error: 'Transaction failed' 
    }, { status: 500 })
  }
}
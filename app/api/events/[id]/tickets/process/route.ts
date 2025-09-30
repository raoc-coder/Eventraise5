import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBraintreeGateway } from '@/lib/braintree-server'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const { registration_id, payment_method_nonce, amount } = body

    if (!registration_id || !payment_method_nonce || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 })
    }

    // Fetch registration
    const { data: registration, error: regErr } = await supabaseAdmin
      .from('event_registrations')
      .select('*, event_tickets!inner(*), events!inner(*)')
      .eq('id', registration_id)
      .eq('event_id', id)
      .single()

    if (regErr || !registration) return NextResponse.json({ error: 'Registration not found' }, { status: 404 })

    // Process payment with Braintree
    const gateway = await getBraintreeGateway()
    const result = await gateway.transaction.sale({
      amount: String(amount),
      paymentMethodNonce: payment_method_nonce,
      options: {
        submitForSettlement: true
      }
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Payment failed', 
        details: result.transaction?.processorResponseText || 'Unknown error' 
      }, { status: 400 })
    }

    const transaction = result.transaction!
    const amountCents = Math.round(amount * 100)
    const feeCents = Math.floor(amountCents * 0.0899)
    const netCents = amountCents - feeCents

    // Update registration with payment details
    const { error: updateErr } = await supabaseAdmin
      .from('event_registrations')
      .update({
        status: 'confirmed',
        braintree_transaction_id: transaction.id,
        fee_cents: feeCents,
        net_cents: netCents,
        settlement_status: 'pending',
      })
      .eq('id', registration_id)

    if (updateErr) {
      console.error('Failed to update registration:', updateErr)
      // Payment succeeded but DB update failed - this is a critical error
      return NextResponse.json({ 
        error: 'Payment processed but failed to update registration',
        transaction_id: transaction.id 
      }, { status: 500 })
    }

    // Update ticket sold count
    const { error: ticketErr } = await supabaseAdmin
      .from('event_tickets')
      .update({ quantity_sold: registration.event_tickets.quantity_sold + registration.quantity })
      .eq('id', registration.event_tickets.id)

    if (ticketErr) {
      console.error('Failed to update ticket count:', ticketErr)
      // Non-critical - payment succeeded
    }

    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      registration_id: registration_id,
      amount: amount,
      fee_cents: feeCents,
      net_cents: netCents
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

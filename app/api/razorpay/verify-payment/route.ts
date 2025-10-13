import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPaymentDetails, calculateRazorpayFees } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay not configured for this environment' }, { status: 503 })
    }

    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`rzp-verify:${clientKey}`, 20)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature, type, registrationId, donationId } = body

    if (!orderId || !paymentId || !signature || !type) {
      return NextResponse.json({ error: 'Missing required payment verification fields' }, { status: 400 })
    }

    const isSignatureValid = verifyPaymentSignature(orderId, paymentId, signature)
    if (!isSignatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const paymentDetails = await fetchPaymentDetails(paymentId)
    if (!paymentDetails.success || !paymentDetails.payment) {
      return NextResponse.json({ error: 'Failed to verify payment with Razorpay' }, { status: 400 })
    }

    const payment = paymentDetails.payment
    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    const grossAmountCents = Number(payment.amount) // in paise
    const { platformFeeCents, netAmountCents } = calculateRazorpayFees(grossAmountCents)

    if (type === 'donation' && donationId) {
      const { error: updateErr } = await supabaseAdmin
        .from('donation_requests')
        .update({
          status: 'confirmed',
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          fee_cents: platformFeeCents,
          net_cents: netAmountCents,
          settlement_status: 'pending',
        })
        .eq('id', donationId)
      if (updateErr) {
        console.error('Supabase update error for donation:', updateErr)
        return NextResponse.json({ error: 'Failed to update donation status' }, { status: 500 })
      }
    } else if (type === 'ticket' && registrationId) {
      const { error: updateErr } = await supabaseAdmin
        .from('event_registrations')
        .update({
          status: 'confirmed',
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          fee_cents: platformFeeCents,
          net_cents: netAmountCents,
          settlement_status: 'pending',
        })
        .eq('id', registrationId)
      if (updateErr) {
        console.error('Supabase update error for ticket registration:', updateErr)
        return NextResponse.json({ error: 'Failed to update ticket registration status' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid type or missing ID for database update' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Payment verified and processed' })
  } catch (error: any) {
    console.error('Razorpay verify payment API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}



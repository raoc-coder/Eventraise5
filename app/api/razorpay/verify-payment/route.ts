import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPaymentDetails } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ 
        error: 'Razorpay not configured for this environment' 
      }, { status: 503 })
    }

    // Rate limiting
    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`rzp-verify:${clientKey}`, 20)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { 
      orderId, 
      paymentId, 
      signature, 
      type, 
      eventId,
      registrationId,
      donorName,
      donorEmail 
    } = body

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ 
        error: 'Missing required fields: orderId, paymentId, signature' 
      }, { status: 400 })
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature)
    if (!isValidSignature) {
      return NextResponse.json({ 
        error: 'Invalid payment signature' 
      }, { status: 400 })
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(paymentId)
    if (!paymentDetails.success || !paymentDetails.payment) {
      return NextResponse.json({ 
        error: 'Failed to verify payment with Razorpay' 
      }, { status: 400 })
    }

    const payment = paymentDetails.payment

    // Verify payment status
    if (payment.status !== 'captured') {
      return NextResponse.json({ 
        error: 'Payment not captured' 
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
    }

    // Handle different payment types
    if (type === 'donation') {
      // Store donation in database
      const { data: donation, error: donationError } = await supabaseAdmin
        .from('donation_requests')
        .insert({
          event_id: eventId,
          amount_cents: payment.amount,
          donor_name: donorName || payment.notes?.donor_name || '',
          donor_email: donorEmail || payment.notes?.donor_email || '',
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          status: 'completed',
          payment_method: 'razorpay',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (donationError) {
        console.error('Donation storage error:', donationError)
        return NextResponse.json({ 
          error: 'Failed to store donation' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        donationId: donation.id,
        paymentId: paymentId,
        amount: payment.amount,
      })

    } else if (type === 'ticket') {
      // Update ticket registration
      if (!registrationId) {
        return NextResponse.json({ 
          error: 'Missing registrationId for ticket payment' 
        }, { status: 400 })
      }

      const { error: updateError } = await supabaseAdmin
        .from('event_registrations')
        .update({
          status: 'confirmed',
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          payment_method: 'razorpay',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', registrationId)

      if (updateError) {
        console.error('Registration update error:', updateError)
        return NextResponse.json({ 
          error: 'Failed to update registration' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        registrationId: registrationId,
        paymentId: paymentId,
        amount: payment.amount,
      })
    }

    return NextResponse.json({ 
      error: 'Invalid payment type' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('Razorpay verification error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

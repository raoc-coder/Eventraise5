import { NextRequest, NextResponse } from 'next/server'
import { createDonationOrder, createTicketOrder } from '@/lib/razorpay'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`rzp-create-order:${clientKey}`, 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { 
      type, 
      eventId, 
      amount, 
      ticketId, 
      quantity, 
      donorName, 
      donorEmail,
      buyerName,
      buyerEmail 
    } = body

    // Validate required fields
    if (!type || !eventId || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, eventId, amount' 
      }, { status: 400 })
    }

    if (type !== 'donation' && type !== 'ticket') {
      return NextResponse.json({ 
        error: 'Invalid type. Must be "donation" or "ticket"' 
      }, { status: 400 })
    }

    // Validate amount (in paise for INR)
    const amountInPaise = parseInt(amount)
    if (isNaN(amountInPaise) || amountInPaise < 100) { // Minimum ₹1
      return NextResponse.json({ 
        error: 'Invalid amount. Minimum ₹1 required' 
      }, { status: 400 })
    }

    let result

    if (type === 'donation') {
      result = await createDonationOrder(
        eventId,
        amountInPaise,
        donorName,
        donorEmail
      )
    } else if (type === 'ticket') {
      if (!ticketId || !quantity) {
        return NextResponse.json({ 
          error: 'Missing required fields for ticket: ticketId, quantity' 
        }, { status: 400 })
      }

      result = await createTicketOrder(
        eventId,
        ticketId,
        parseInt(quantity),
        amountInPaise,
        buyerName,
        buyerEmail
      )
    }

    if (!result?.success) {
      return NextResponse.json({ 
        error: result?.error || 'Failed to create order' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      amount: result.amount,
      currency: result.currency,
      receipt: result.receipt,
    })

  } catch (error: any) {
    console.error('Razorpay create order error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

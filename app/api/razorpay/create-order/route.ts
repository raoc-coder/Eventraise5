import { NextRequest, NextResponse } from 'next/server'
import { createDonationOrder, createTicketOrder } from '@/lib/razorpay'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay not configured for this environment' }, { status: 503 })
    }

    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`rzp-create-order:${clientKey}`, 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { type, eventId, amountPaise, ticketId, quantity, buyerName, buyerEmail, donorName, donorEmail } = body

    if (!eventId || !amountPaise || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let result
    if (type === 'donation') {
      result = await createDonationOrder(eventId, Math.round(Number(amountPaise)), donorName, donorEmail)
    } else if (type === 'ticket') {
      if (!ticketId || !quantity) {
        return NextResponse.json({ error: 'Missing ticket details for ticket order' }, { status: 400 })
      }
      result = await createTicketOrder(eventId, ticketId, Number(quantity), Math.round(Number(amountPaise)), buyerName, buyerEmail)
    } else {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to create Razorpay order' }, { status: 500 })
    }

    return NextResponse.json({ order: result.order })
  } catch (error: any) {
    console.error('Razorpay create order API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}



/**
 * Razorpay integration for Indian payments
 * Handles order creation, verification, and payment processing
 */

import Razorpay from 'razorpay'

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

/**
 * Create a Razorpay order for donations
 */
export async function createDonationOrder(
  eventId: string, 
  amountInPaise: number, 
  donorName?: string, 
  donorEmail?: string
) {
  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `donation_${eventId}_${Date.now()}`,
      notes: {
        event_id: eventId,
        type: 'donation',
        donor_name: donorName || '',
        donor_email: donorEmail || '',
      },
    })

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    }
  } catch (error: any) {
    console.error('Razorpay order creation failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to create order',
    }
  }
}

/**
 * Create a Razorpay order for ticket purchases
 */
export async function createTicketOrder(
  eventId: string,
  ticketId: string,
  quantity: number,
  amountInPaise: number,
  buyerName?: string,
  buyerEmail?: string
) {
  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `ticket_${eventId}_${ticketId}_${Date.now()}`,
      notes: {
        event_id: eventId,
        ticket_id: ticketId,
        quantity: quantity.toString(),
        type: 'ticket',
        buyer_name: buyerName || '',
        buyer_email: buyerEmail || '',
      },
    })

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    }
  } catch (error: any) {
    console.error('Razorpay ticket order creation failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to create ticket order',
    }
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    return expectedSignature === signature
  } catch (error) {
    console.error('Payment verification failed:', error)
    return false
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId)
    return {
      success: true,
      payment,
    }
  } catch (error: any) {
    console.error('Failed to fetch payment details:', error)
    return {
      success: false,
      error: error.message || 'Failed to fetch payment',
    }
  }
}

/**
 * Calculate platform fee for Razorpay payments (same as PayPal)
 */
export function calculateRazorpayFees(amountInPaise: number) {
  const platformFeePercentage = 8.99 // 8.99% platform fee
  const platformFeePaise = Math.floor(amountInPaise * (platformFeePercentage / 100))
  const netAmountPaise = amountInPaise - platformFeePaise

  return {
    grossAmount: amountInPaise,
    platformFee: platformFeePaise,
    netAmount: netAmountPaise,
  }
}

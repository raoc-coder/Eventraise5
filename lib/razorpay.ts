// lib/razorpay.ts
/**
 * Razorpay integration for Indian payments
 * Handles order creation, verification, and payment processing
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'

// Initialize Razorpay instance only when environment variables are available
export const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay environment variables not configured')
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

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
    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `donation_${eventId}_${Date.now()}`,
      notes: {
        event_id: eventId,
        donor_name: donorName ?? null,
        donor_email: donorEmail ?? null,
      },
    })
    return { success: true as const, order }
  } catch (error: any) {
    console.error('Error creating Razorpay donation order:', error)
    return { success: false as const, error: error.message }
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
    const razorpay = getRazorpayInstance()
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `ticket_${eventId}_${ticketId}_${Date.now()}`,
      notes: {
        event_id: eventId,
        ticket_id: ticketId,
        quantity: quantity,
        buyer_name: buyerName ?? null,
        buyer_email: buyerEmail ?? null,
      },
    })
    return { success: true as const, order }
  } catch (error: any) {
    console.error('Error creating Razorpay ticket order:', error)
    return { success: false as const, error: error.message }
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
  if (!process.env.RAZORPAY_KEY_SECRET) return false
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  hmac.update(`${orderId}|${paymentId}`)
  const generatedSignature = hmac.digest('hex')
  return generatedSignature === signature
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPaymentDetails(paymentId: string) {
  try {
    const razorpay = getRazorpayInstance()
    const payment = await razorpay.payments.fetch(paymentId)
    return {
      success: true as const,
      payment,
    }
  } catch (error: any) {
    console.error('Error fetching Razorpay payment details:', error)
    return { success: false as const, error: error.message }
  }
}

/**
 * Calculate platform fees for Razorpay transactions
 * For now, a fixed 8.99% fee is applied to the gross amount.
 */
export function calculateRazorpayFees(grossAmountCents: number): {
  platformFeeCents: number
  netAmountCents: number
} {
  const platformFeeRate = 0.0899 // 8.99%
  const platformFeeCents = Math.floor(grossAmountCents * platformFeeRate)
  const netAmountCents = grossAmountCents - platformFeeCents
  return { platformFeeCents, netAmountCents }
}



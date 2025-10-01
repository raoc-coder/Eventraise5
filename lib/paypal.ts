// PayPal configuration
export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  environment: process.env.PAYPAL_ENVIRONMENT === 'production' ? 'live' : 'sandbox',
  webhookId: process.env.PAYPAL_WEBHOOK_ID!,
  baseUrl: process.env.PAYPAL_ENVIRONMENT === 'production' 
    ? 'https://api.paypal.com' 
    : 'https://api.sandbox.paypal.com'
}

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  return data.access_token
}

// Fee calculation utilities
export function calculatePlatformFee(amount: number): {
  platformFee: number
  netAmount: number
  paypalFee: number
  totalFees: number
} {
  const platformFeeRate = 0.0899 // 8.99%
  const paypalFeeRate = 0.029 // 2.9% (approximate)
  const paypalFixedFee = 0.49 // $0.49 fixed fee
  
  const platformFee = Math.round(amount * platformFeeRate * 100) / 100
  const paypalFee = Math.round((amount * paypalFeeRate + paypalFixedFee) * 100) / 100
  const totalFees = platformFee + paypalFee
  const netAmount = Math.round((amount - totalFees) * 100) / 100
  
  return {
    platformFee,
    netAmount,
    paypalFee,
    totalFees
  }
}

// Create PayPal order for donation
export async function createDonationOrder(eventId: string, amount: number, donorName?: string, donorEmail?: string) {
  const fees = calculatePlatformFee(amount)

  // Important: Charge exactly the entered amount at PayPal.
  // Platform and PayPal fees are internal accounting and should NOT be added
  // to the PayPal order amount or its breakdown, otherwise PayPal may reject
  // the request or the charged amount will not match the UI expectation.
  const orderRequest = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: `donation_${eventId}_${Date.now()}`,
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        // Keep items optional; not required for a simple donation
        custom_id: `donation_${eventId}`,
        soft_descriptor: 'EventraiseHub'
      }
    ],
    application_context: {
      brand_name: 'EventraiseHub',
      landing_page: 'NO_PREFERENCE',
      user_action: 'PAY_NOW',
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
    }
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `donation_${eventId}_${Date.now()}`
      },
      body: JSON.stringify(orderRequest)
    })

    const order = await response.json()
    
    if (!response.ok) {
      throw new Error(order.message || 'Failed to create PayPal order')
    }

    return {
      success: true,
      orderId: order.id,
      fees
    }
  } catch (error) {
    console.error('PayPal order creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Capture PayPal order
export async function captureOrder(orderId: string) {
  try {
    const accessToken = await getPayPalAccessToken()
    const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `capture_${orderId}_${Date.now()}`
      }
    })

    const capture = await response.json()
    
    if (!response.ok) {
      throw new Error(capture.message || 'Failed to capture PayPal order')
    }

    return {
      success: true,
      captureId: capture.id,
      status: capture.status,
      amount: capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value
    }
  } catch (error) {
    console.error('PayPal order capture failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Verify PayPal webhook signature
export function verifyWebhookSignature(headers: any, body: string): boolean {
  // This would need to be implemented with PayPal's webhook verification
  // For now, we'll return true in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // TODO: Implement proper webhook signature verification
  return true
}

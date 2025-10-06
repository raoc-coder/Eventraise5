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

  const text = await response.text()
  if (!response.ok) {
    console.error('PayPal token error:', {
      status: response.status,
      statusText: response.statusText,
      body: text?.slice(0, 1000)
    })
    throw new Error(`Failed to obtain PayPal access token (${response.status})`)
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch (e) {
    console.error('PayPal token JSON parse error:', text)
    throw new Error('Invalid PayPal token response')
  }
  if (!data?.access_token) {
    console.error('PayPal token missing access_token:', data)
    throw new Error('Missing access token from PayPal')
  }
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

    const raw = await response.text()
    let order: any = null
    try {
      order = raw ? JSON.parse(raw) : null
    } catch (e) {
      // leave as text
    }

    if (!response.ok) {
      console.error('PayPal create order error:', {
        status: response.status,
        statusText: response.statusText,
        body: raw?.slice(0, 2000)
      })
      const details = order?.details?.map((d: any) => `${d.issue}: ${d.description}`).join('; ')
      const name = order?.name
      return {
        success: false as const,
        error: `PayPal create order failed (${response.status}) ${name ? '[' + name + ']' : ''} ${details || order?.message || ''}`.trim()
      }
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

    const raw = await response.text()
    let capture: any = null
    try {
      capture = raw ? JSON.parse(raw) : null
    } catch (e) {
      // leave as text
    }
    
    if (!response.ok) {
      console.error('PayPal capture error:', {
        status: response.status,
        statusText: response.statusText,
        body: raw?.slice(0, 2000)
      })
      throw new Error(capture?.message || `Failed to capture PayPal order (${response.status})`)
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
export async function verifyWebhookSignature(headers: any, body: string): Promise<boolean> {
  // Skip verification in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  try {
    // Normalize header keys to lowercase for case-insensitive access
    const normalizedHeaders: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers || {})) {
      normalizedHeaders[String(key).toLowerCase()] = String(value)
    }

    const authAlgoHeader = normalizedHeaders['paypal-auth-algo']
    const transmissionId = normalizedHeaders['paypal-transmission-id']
    const transmissionSig = normalizedHeaders['paypal-transmission-sig']
    const transmissionTime = normalizedHeaders['paypal-transmission-time']
    const certUrlHeader = normalizedHeaders['paypal-cert-url']
    const certIdFallback = normalizedHeaders['paypal-cert-id']

    if (!authAlgoHeader || !transmissionId || !transmissionSig || !transmissionTime || (!certUrlHeader && !certIdFallback)) {
      console.error('Missing PayPal webhook headers')
      return false
    }

    // Resolve certificate URL: prefer header-provided URL, otherwise construct from cert id
    const resolvedCertUrl = certUrlHeader || `${paypalConfig.baseUrl}/v1/notifications/certs/${certIdFallback}`

    // Fetch PayPal public certificate
    const certResponse = await fetch(resolvedCertUrl)
    if (!certResponse.ok) {
      console.error('Failed to fetch PayPal certificate')
      return false
    }
    const cert = await certResponse.text()

    // Construct the signed content per PayPal docs
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      console.error('Missing PAYPAL_WEBHOOK_ID for webhook verification')
      return false
    }
    const signatureString = `${transmissionId}|${transmissionTime}|${webhookId}|${body}`

    // Map PayPal algo header to Node crypto algorithm
    const algoMap: Record<string, string> = {
      'sha256withrsa': 'RSA-SHA256',
      'sha1withrsa': 'RSA-SHA1'
    }
    const nodeAlgo = algoMap[authAlgoHeader.toLowerCase()] || 'RSA-SHA256'

    const crypto = require('crypto')
    const verifier = crypto.createVerify(nodeAlgo)
    verifier.update(signatureString, 'utf8')

    const isValid = verifier.verify(cert, transmissionSig, 'base64')
    if (!isValid) {
      console.error('PayPal webhook signature verification failed')
    }
    return isValid
  } catch (error) {
    console.error('PayPal webhook verification error:', error)
    return false
  }
}

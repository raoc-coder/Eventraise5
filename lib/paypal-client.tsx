'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useRef } from 'react'

function createIdempotencyKey(prefix: string, payload: Record<string, unknown>) {
  const payloadPart = Object.values(payload)
    .map((value) => String(value ?? ''))
    .join('_')
    .slice(0, 64)
    .replace(/[^a-zA-Z0-9_-]/g, '')
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}_${payloadPart}_${randomPart}`.slice(0, 120)
}

// PayPal client configuration factory
export const createPaypalClientConfig = (currency: string = 'USD') => ({
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency,
  intent: 'capture',
  components: 'buttons',
  enableFunding: 'paylater,venmo,card,credit,paypal',
  disableFunding: '',
  dataSdkIntegration: 'eventraisehub'
})

// Default USD configuration for backward compatibility
export const paypalClientConfig = createPaypalClientConfig('USD')

// PayPal button component for donations
export function PayPalDonationButton({
  amount,
  eventId,
  currency = 'USD',
  personalCampaignId,
  onSuccess,
  onError,
  disabled = false
}: {
  amount: number
  eventId: string
  currency?: string
  /**
   * Optional P2P attribution (Sprint 1.5). When set, the server-side
   * create-order route validates that the campaign is active and tied to
   * `eventId`. Invalid attributions are dropped silently — donation still
   * posts to the event.
   */
  personalCampaignId?: string
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}) {
  const createOrderKeyRef = useRef<string>('')
  const captureOrderKeyByOrderIdRef = useRef<Record<string, string>>({})

  const createOrder = async () => {
    try {
      // Include personalCampaignId in the idempotency fingerprint so two
      // different attribution paths (event-only vs. P2P) never collapse to
      // the same key (ADR-0009).
      const createKey =
        createOrderKeyRef.current ||
        createIdempotencyKey('pp_create', {
          eventId,
          amount,
          currency,
          type: 'donation',
          pcid: personalCampaignId || 'none',
        })
      createOrderKeyRef.current = createKey
      const requestBody: Record<string, unknown> = {
        eventId,
        amount,
        currency,
        type: 'donation',
      }
      if (personalCampaignId) {
        requestBody.personalCampaignId = personalCampaignId
      }
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': createKey,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order')
      }

      if (data.orderId) {
        captureOrderKeyByOrderIdRef.current[data.orderId] = createIdempotencyKey('pp_capture', {
          eventId,
          orderId: data.orderId,
          type: 'donation',
          pcid: personalCampaignId || 'none',
        })
      }
      return data.orderId
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      onError(error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      const captureKey =
        captureOrderKeyByOrderIdRef.current[data.orderID] ||
        createIdempotencyKey('pp_capture', { eventId, orderId: data.orderID, type: 'donation' })
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': captureKey,
        },
        body: JSON.stringify({
          orderId: data.orderID,
          eventId,
          type: 'donation'
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment')
      }

      onSuccess(data.orderID)
    } catch (error) {
      console.error('Error capturing PayPal payment:', error)
      onError(error instanceof Error ? error.message : 'Payment capture failed')
    }
  }

  const handlePayPalError = (error: any) => {
    console.error('PayPal button error:', error)
    onError('Payment failed. Please try again.')
  }

  return (
    <PayPalScriptProvider options={createPaypalClientConfig(currency)}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={handlePayPalError}
        disabled={disabled}
        style={{ layout: 'vertical', label: 'paypal' }}
      />
    </PayPalScriptProvider>
  )
}

// PayPal button component for tickets
export function PayPalTicketButton({
  amount,
  eventId,
  ticketId,
  quantity,
  currency = 'USD',
  onSuccess,
  onError,
  disabled = false
}: {
  amount: number
  eventId: string
  ticketId: string
  quantity: number
  currency?: string
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}) {
  const createOrderKeyRef = useRef<string>('')
  const captureOrderKeyByOrderIdRef = useRef<Record<string, string>>({})

  const createOrder = async () => {
    try {
      const createKey =
        createOrderKeyRef.current ||
        createIdempotencyKey('pp_create', { eventId, ticketId, amount, quantity, currency, type: 'ticket' })
      createOrderKeyRef.current = createKey
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': createKey,
        },
        body: JSON.stringify({
          eventId,
          ticketId,
          amount,
          quantity,
          currency,
          type: 'ticket'
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order')
      }

      if (data.orderId) {
        captureOrderKeyByOrderIdRef.current[data.orderId] = createIdempotencyKey('pp_capture', {
          eventId,
          orderId: data.orderId,
          ticketId,
          type: 'ticket',
        })
      }
      return data.orderId
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      onError(error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      const captureKey =
        captureOrderKeyByOrderIdRef.current[data.orderID] ||
        createIdempotencyKey('pp_capture', { eventId, orderId: data.orderID, ticketId, type: 'ticket' })
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': captureKey,
        },
        body: JSON.stringify({
          orderId: data.orderID,
          eventId,
          ticketId,
          type: 'ticket'
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture payment')
      }

      onSuccess(data.orderID)
    } catch (error) {
      console.error('Error capturing PayPal payment:', error)
      onError(error instanceof Error ? error.message : 'Payment capture failed')
    }
  }

  const handlePayPalError = (error: any) => {
    console.error('PayPal button error:', error)
    onError('Payment failed. Please try again.')
  }

  return (
    <PayPalScriptProvider options={createPaypalClientConfig(currency)}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={handlePayPalError}
        disabled={disabled}
        style={{ layout: 'vertical', label: 'paypal' }}
      />
    </PayPalScriptProvider>
  )
}

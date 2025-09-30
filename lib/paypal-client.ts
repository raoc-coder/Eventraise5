'use client'

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

// PayPal client configuration
export const paypalClientConfig = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'capture',
  components: 'buttons',
  enableFunding: 'paylater,venmo,card',
  disableFunding: '',
  dataSdkIntegration: 'eventraisehub'
}

// PayPal button component for donations
export function PayPalDonationButton({
  amount,
  eventId,
  onSuccess,
  onError,
  disabled = false
}: {
  amount: number
  eventId: string
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}) {
  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          amount,
          type: 'donation'
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order')
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
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          eventId
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

  const onError = (error: any) => {
    console.error('PayPal button error:', error)
    onError('Payment failed. Please try again.')
  }

  return (
    <PayPalScriptProvider options={paypalClientConfig}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={disabled}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45
        }}
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
  onSuccess,
  onError,
  disabled = false
}: {
  amount: number
  eventId: string
  ticketId: string
  quantity: number
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
  disabled?: boolean
}) {
  const createOrder = async () => {
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          ticketId,
          amount,
          quantity,
          type: 'ticket'
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order')
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
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const onError = (error: any) => {
    console.error('PayPal button error:', error)
    onError('Payment failed. Please try again.')
  }

  return (
    <PayPalScriptProvider options={paypalClientConfig}>
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        disabled={disabled}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 45
        }}
      />
    </PayPalScriptProvider>
  )
}

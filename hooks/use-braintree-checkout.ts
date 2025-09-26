'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface CheckoutOptions {
  amount: number
  campaignId: string
  profileId?: string
  donorName?: string
  donorEmail?: string
  successUrl?: string
  cancelUrl?: string
}

export function useBraintreeCheckout() {
  const [isLoading, setIsLoading] = useState(false)

  const createCheckout = async (options: CheckoutOptions) => {
    setIsLoading(true)

    try {
      // Generate client token
      const tokenResponse = await fetch('/api/braintree/client-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get payment token')
      }

      const { clientToken } = await tokenResponse.json()

      // Create checkout session with Braintree
      const response = await fetch('/api/braintree/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: options.amount,
          campaign_id: options.campaignId,
          profile_id: options.profileId,
          donor_name: options.donorName,
          donor_email: options.donorEmail,
          success_url: options.successUrl || `${window.location.origin}/payment/success?campaign=${options.campaignId}`,
          cancel_url: options.cancelUrl || `${window.location.origin}/payment/cancel?campaign=${options.campaignId}`,
          client_token: clientToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // For Braintree, we'll redirect to a hosted payment page or use Drop-in UI
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        // If no hosted page, we'll use the Drop-in UI inline
        return data
      }

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process payment')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const processPayment = async (paymentMethodNonce: string, amount: number, campaignId: string) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/braintree/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          paymentMethodNonce: paymentMethodNonce,
          campaignId: campaignId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed')
      }

      if (result.success) {
        return {
          success: true,
          transaction: result.transaction
        }
      } else {
        throw new Error(result.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCheckout,
    processPayment,
    isLoading,
  }
}
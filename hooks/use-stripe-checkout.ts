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

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false)

  const createCheckout = async (options: CheckoutOptions) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/create-checkout', {
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
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process payment')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCheckout,
    isLoading,
  }
}

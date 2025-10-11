'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayButtonProps {
  orderId: string
  amount: number
  currency: string
  name: string
  description: string
  onSuccess: (paymentResponse: any) => void
  onError?: (error: any) => void
  onDismiss?: () => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  className?: string
  disabled?: boolean
}

export function RazorpayButton({
  orderId,
  amount,
  currency,
  name,
  description,
  onSuccess,
  onError,
  onDismiss,
  prefill,
  className = '',
  disabled = false,
}: RazorpayButtonProps) {
  const razorpayLoaded = useRef(false)

  useEffect(() => {
    if (window.Razorpay && !razorpayLoaded.current) {
      razorpayLoaded.current = true
    }
  }, [])

  const handlePayment = () => {
    if (!window.Razorpay) {
      onError?.('Razorpay not loaded')
      return
    }

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: amount,
      currency: currency,
      name: name,
      description: description,
      order_id: orderId,
      handler: onSuccess,
      prefill: prefill || {},
      theme: {
        color: '#2563eb', // Blue theme to match EventraiseHub
      },
      modal: {
        ondismiss: onDismiss,
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          razorpayLoaded.current = true
        }}
      />
      <Button
        onClick={handlePayment}
        disabled={disabled || !razorpayLoaded.current}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${className}`}
      >
        {razorpayLoaded.current ? (
          <>
            <span className="mr-2">₹</span>
            Pay with Razorpay
          </>
        ) : (
          'Loading Razorpay...'
        )}
      </Button>
    </>
  )
}

// Razorpay donation button with consistent styling
export function RazorpayDonationButton({
  orderId,
  amount,
  onSuccess,
  onError,
  onDismiss,
  prefill,
  className = '',
  disabled = false,
}: Omit<RazorpayButtonProps, 'currency' | 'name' | 'description'>) {
  return (
    <RazorpayButton
      orderId={orderId}
      amount={amount}
      currency="INR"
      name="EventraiseHub"
      description="Event Donation"
      onSuccess={onSuccess}
      onError={onError}
      onDismiss={onDismiss}
      prefill={prefill}
      className={className}
      disabled={disabled}
    />
  )
}

// Razorpay ticket button with consistent styling
export function RazorpayTicketButton({
  orderId,
  amount,
  onSuccess,
  onError,
  onDismiss,
  prefill,
  className = '',
  disabled = false,
}: Omit<RazorpayButtonProps, 'currency' | 'name' | 'description'>) {
  return (
    <RazorpayButton
      orderId={orderId}
      amount={amount}
      currency="INR"
      name="EventraiseHub"
      description="Event Ticket Purchase"
      onSuccess={onSuccess}
      onError={onError}
      onDismiss={onDismiss}
      prefill={prefill}
      className={className}
      disabled={disabled}
    />
  )
}

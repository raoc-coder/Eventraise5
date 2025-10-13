'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface RazorpayButtonProps {
  amountPaise: number
  eventId: string
  type: 'donation' | 'ticket'
  ticketId?: string
  quantity?: number
  buyerName?: string
  buyerEmail?: string
  onSuccess: (paymentId: string, orderId: string, signature: string) => void
  onError: (error: any) => void
  disabled?: boolean
}

declare global {
  interface Window { Razorpay: any }
}

export function RazorpayButton(props: RazorpayButtonProps) {
  const { amountPaise, eventId, type, ticketId, quantity, buyerName, buyerEmail, onSuccess, onError, disabled } = props
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const disableRzp = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DISABLE_RAZORPAY === 'true'

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setScriptLoaded(true)
    }
  }, [])

  const loadScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('Window unavailable'))
      if ((window as any).Razorpay) return resolve()
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]') as HTMLScriptElement | null
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')))
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Razorpay script'))
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!scriptLoaded || !(window as any).Razorpay) {
      try {
        await loadScript()
        setScriptLoaded(true)
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load Razorpay script.')
        return
      }
    }
    if (!keyId) {
      toast.error('Razorpay Key ID is not configured.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = {
        type,
        eventId,
        amountPaise,
        ticketId,
        quantity,
        buyerName,
        buyerEmail,
      }
      console.log('[Razorpay] create-order payload', payload)
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const orderData = await orderResponse.json()
      if (!orderResponse.ok) {
        console.error('[Razorpay] create-order error', orderData)
      }
      if (!orderResponse.ok) {
        setError(orderData.error || 'Failed to create Razorpay order.')
        toast.error(orderData.error || 'Failed to create Razorpay order.')
        setLoading(false)
        return
      }

      const { order } = orderData
      const options = {
        key: keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'EventraiseHub',
        description: type === 'donation' ? 'Event Donation' : 'Event Ticket Purchase',
        order_id: order.id,
        handler: function (response: any) {
          onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature)
        },
        prefill: {
          name: buyerName || '',
          email: buyerEmail || '',
          contact: '',
        },
        notes: {
          event_id: eventId,
          type,
          ...(ticketId ? { ticket_id: ticketId } : {}),
          ...(quantity ? { quantity } : {}),
        },
        theme: { color: '#3B82F6' },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setError(response.error?.description || 'Payment failed.')
        toast.error(response.error?.description || 'Payment failed.')
        onError(response.error)
      })
      rzp.open()
    } catch (err: any) {
      console.error('Razorpay payment initiation error:', err)
      setError(err.message || 'An unexpected error occurred.')
      toast.error(err.message || 'An unexpected error occurred.')
      onError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={disableRzp || disabled ? undefined : handlePayment}
        disabled={disableRzp || disabled || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {disableRzp ? 'Razorpay disabled (diagnostic)' : (loading ? 'Processing...' : 'Pay with UPI / Cards (Razorpay)')}
      </Button>
      {error && !disableRzp && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  )
}



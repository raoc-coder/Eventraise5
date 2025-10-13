'use client'

import Script from 'next/script'
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
}

declare global {
  interface Window { Razorpay: any }
}

export function RazorpayButton(props: RazorpayButtonProps) {
  const { amountPaise, eventId, type, ticketId, quantity, buyerName, buyerEmail, onSuccess, onError } = props
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setScriptLoaded(true)
    }
  }, [])

  const handlePayment = async () => {
    if (!scriptLoaded || !window.Razorpay) {
      toast.error('Razorpay script not loaded. Please try again.')
      return
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

      const rzp = new window.Razorpay(options)
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptLoaded(true)} onError={() => toast.error('Failed to load Razorpay script.')} />
      <Button onClick={handlePayment} disabled={loading || !scriptLoaded} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        {loading ? 'Processing...' : 'Pay with UPI / Cards (Razorpay)'}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  )
}



'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBraintreeClient } from '@/lib/braintree-client'

interface PaymentFormProps {
  amount: number
  eventId: string
  onSuccess: (transactionId: string) => void
}

function PaymentForm({ amount, eventId, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [dropinInstance, setDropinInstance] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const dropinRef = useRef<HTMLDivElement>(null)
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    isAnonymous: false
  })

  useEffect(() => {
    const initializeBraintree = async () => {
      try {
        // Check if Braintree is configured
        if (!process.env.NEXT_PUBLIC_BRAINTREE_CLIENT_TOKEN) {
          throw new Error('Braintree not configured')
        }

        // Get client token from server
        const response = await fetch('/api/braintree/client-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to get client token')
        }

        const { clientToken } = await response.json()
        
        // Create Braintree client
        const braintreeClient = await getBraintreeClient()
        if (!braintreeClient) {
          throw new Error('Failed to create Braintree client')
        }

        setClient(braintreeClient)

        // Create Drop-in UI
        const braintree = await import('braintree-web-drop-in')
        const dropin = await braintree.default.create({
          authorization: clientToken,
          container: dropinRef.current,
          card: {
            cardholderName: {
              required: true
            }
          },
          paypal: {
            flow: 'vault'
          },
          venmo: true,
          applePay: {
            displayName: 'EventraiseHUB',
            paymentRequest: {
              total: {
                label: 'Donation',
                amount: amount.toFixed(2)
              }
            }
          },
          googlePay: {
            merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID,
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: amount.toFixed(2),
              currencyCode: 'USD'
            }
          }
        })

        setDropinInstance(dropin)
      } catch (error) {
        console.error('Braintree initialization error:', error)
        toast.error('Failed to initialize payment system')
      }
    }

    initializeBraintree()

    // Cleanup
    return () => {
      if (dropinInstance) {
        dropinInstance.teardown()
      }
    }
  }, [amount, dropinInstance])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!dropinInstance) {
      toast.error('Payment system not ready')
      return
    }

    setLoading(true)

    try {
      // Request payment method from Drop-in
      const { nonce, type } = await dropinInstance.requestPaymentMethod()

      // Create transaction on server
      const response = await fetch('/api/braintree/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          paymentMethodNonce: nonce,
          paymentMethodType: type,
          eventId,
          donorInfo,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed')
      }

      if (result.success) {
        toast.success('Payment successful! Thank you for your donation.')
        onSuccess(result.transaction.id)
      } else {
        throw new Error(result.message || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={donorInfo.name}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={donorInfo.email}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message (Optional)</Label>
          <textarea
            id="message"
            value={donorInfo.message}
            onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
            placeholder="Leave a message for the organizers..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={donorInfo.isAnonymous}
            onChange={(e) => setDonorInfo(prev => ({ ...prev, isAnonymous: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <Label htmlFor="anonymous">Make this donation anonymous</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div ref={dropinRef} className="min-h-[200px] border border-gray-300 rounded-md p-4">
          {/* Braintree Drop-in UI will be rendered here */}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !dropinInstance}>
        {loading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
      </Button>
    </form>
  )
}

export default function BraintreeCheckout({ amount, eventId, onSuccess }: PaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Make a Donation
        </CardTitle>
        <CardDescription>
          Secure payment powered by Braintree
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PaymentForm amount={amount} eventId={eventId} onSuccess={onSuccess} />
      </CardContent>
    </Card>
  )
}
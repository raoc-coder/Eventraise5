'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number
  eventId: string
  onSuccess: (paymentIntentId: string) => void
}

function PaymentForm({ amount, eventId, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    isAnonymous: false
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: donorInfo.name,
          email: donorInfo.email,
        },
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        return
      }

      // Create payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          eventId,
          donorInfo,
          paymentMethodId: paymentMethod.id,
        }),
      })

      const { clientSecret } = await response.json()

      if (!clientSecret) {
        throw new Error('Failed to create payment intent')
      }

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret)

      if (confirmError) {
        toast.error(confirmError.message || 'Payment failed')
      } else {
        toast.success('Payment successful! Thank you for your donation.')
        onSuccess(paymentMethod.id)
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
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
        <Label>Card Information</Label>
        <div className="p-4 border border-gray-300 rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !stripe}>
        {loading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
      </Button>
    </form>
  )
}

export default function StripeCheckout({ amount, eventId, onSuccess }: PaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Make a Donation
        </CardTitle>
        <CardDescription>
          Secure payment powered by Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <PaymentForm amount={amount} eventId={eventId} onSuccess={onSuccess} />
        </Elements>
      </CardContent>
    </Card>
  )
}

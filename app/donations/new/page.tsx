'use client'

import { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useSearchParams } from 'next/navigation'
import { createDonationIntentSchema } from '@/lib/validators'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function DonationForm() {
  const stripe = useStripe()
  const elements = useElements()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || undefined
  const [amount, setAmount] = useState('1')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [feeCents, setFeeCents] = useState<number>(0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try {
      // Client validation
      setErrors({})
      try {
        createDonationIntentSchema.parse({
          amount: Number(amount),
          currency: 'usd',
          donor_name: name || undefined,
          donor_email: email || undefined,
          message: message || undefined,
        })
        if (!amount || Number(amount) <= 0) {
          throw new Error('Amount must be greater than 0')
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw Object.assign(new Error('Please enter a valid email address'), { field: 'donor_email' })
        }
      } catch (err: any) {
        const fieldErrs: Record<string, string> = {}
        if (err?.issues?.length) {
          for (const issue of err.issues) {
            const path = issue.path?.[0]
            if (path && !fieldErrs[path]) fieldErrs[path] = issue.message || 'Invalid value'
          }
        }
        if (err?.field) {
          fieldErrs[err.field] = err.message
        } else if (err?.message && !fieldErrs.amount) {
          fieldErrs.amount = err.message
        }
        setErrors(fieldErrs)
        toast.error('Please fix the highlighted fields.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/donations/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), donor_name: name, donor_email: email, message, eventId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create payment')
      if (typeof data.fee_cents === 'number') setFeeCents(data.fee_cents)

      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not found')

      const result = await stripe.confirmCardPayment(data.client_secret!, {
        payment_method: {
          card,
          billing_details: { name, email },
        },
      })

      if (result.error) {
        toast.error(result.error.message || 'Payment failed')
      } else if (result.paymentIntent?.status === 'succeeded') {
        toast.success('Thank you for your donation!')
      } else {
        toast('Payment status: ' + result.paymentIntent?.status)
      }
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const presetAmounts = [1, 5, 10, 25, 50, 100]

  return (
    <form onSubmit={submit} className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <Label htmlFor="amount" className="text-base font-medium">Donation Amount (USD)</Label>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset.toString() ? "default" : "outline"}
                onClick={() => setAmount(preset.toString())}
                className={`${amount === preset.toString() ? "btn-primary" : "btn-secondary"} min-h-[44px] text-base`}
              >
                ${preset}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Custom:</span>
            <Input 
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              type="number" 
              min="1" 
              step="1"
              className="w-24 min-h-[44px] text-base"
              aria-invalid={!!errors.amount} 
              required 
            />
            <span className="text-sm text-gray-600">USD</span>
          </div>
          <p className="text-xs text-gray-500">You can adjust the amount. Platform fee is shown below.</p>
        </div>
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
      </div>
      {Number(amount) > 0 && (
        <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between mb-2"><span className="text-gray-700">Donation</span><span className="text-gray-900 font-medium">${Number(amount).toFixed(2)}</span></div>
          <div className="flex justify-between mb-2"><span className="text-gray-700">Platform fee (8.99%)</span><span className="text-gray-900 font-medium">${((Number(amount)*0.0899)).toFixed(2)}</span></div>
          <div className="border-t border-blue-300 pt-2 flex justify-between font-bold"><span className="text-gray-900">Total charged</span><span className="text-blue-600">${(Number(amount)*(1+0.0899)).toFixed(2)}</span></div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          aria-invalid={!!errors.donor_name}
          className="min-h-[44px] text-base"
        />
        <p className="text-xs text-gray-500">Optional. Helps us personalize your receipt.</p>
        {errors.donor_name && <p className="text-red-500 text-sm">{errors.donor_name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-base font-medium">Email</Label>
        <Input 
          id="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          type="email" 
          aria-invalid={!!errors.donor_email}
          className="min-h-[44px] text-base"
        />
        <p className="text-xs text-gray-500">Optional. Enter to receive an emailed receipt.</p>
        {errors.donor_email && <p className="text-red-500 text-sm">{errors.donor_email}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-base font-medium">Card Details</Label>
        <div className="p-4 border-2 border-gray-200 rounded-lg bg-white min-h-[60px]">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-base font-medium">Message (optional)</Label>
        <Input 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[44px] text-base"
        />
        <p className="text-xs text-gray-500">Optional. A short note to the organizer.</p>
      </div>
      <Button 
        type="submit" 
        className="w-full btn-primary min-h-[50px] text-base font-semibold" 
        disabled={loading || !stripe}
      >
        {loading ? 'Processing your donation…' : `Donate $${Number(amount || '0') || 0}`}
      </Button>
    </form>
  )
}

export default function NewDonationPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md event-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-900 text-xl sm:text-2xl">Make a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <Suspense fallback={<div className="text-gray-600">Loading…</div>}>
              <DonationForm />
            </Suspense>
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}



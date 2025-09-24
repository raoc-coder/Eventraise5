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
  const [amount, setAmount] = useState('25')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      } catch (err: any) {
        const fieldErrs: Record<string, string> = {}
        if (err?.issues?.length) {
          for (const issue of err.issues) {
            const path = issue.path?.[0]
            if (path && !fieldErrs[path]) fieldErrs[path] = issue.message || 'Invalid value'
          }
        }
        if (err?.message && !fieldErrs.amount) fieldErrs.amount = err.message
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

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" aria-invalid={!!errors.amount} required />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.donor_name} />
        {errors.donor_name && <p className="text-red-500 text-sm">{errors.donor_name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" aria-invalid={!!errors.donor_email} />
        {errors.donor_email && <p className="text-red-500 text-sm">{errors.donor_email}</p>}
      </div>
      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="p-3 border rounded-lg bg-white">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Input id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button type="submit" className="w-full btn-primary" disabled={loading || !stripe}>
        {loading ? 'Processing…' : 'Donate'}
      </Button>
    </form>
  )
}

export default function NewDonationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-soft">
        <CardHeader>
          <CardTitle className="text-white">Make a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise}>
            <Suspense fallback={<div className="text-gray-300">Loading…</div>}>
              <DonationForm />
            </Suspense>
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}



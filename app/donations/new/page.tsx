'use client'

import { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { createDonationIntentSchema } from '@/lib/validators'
// import BraintreeCheckout from '@/components/payment/BraintreeCheckout'

function DonationForm() {
  const searchParams = useSearchParams()
  const eventId = searchParams?.get('eventId') || undefined
  const [amount, setAmount] = useState(25)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePaymentSuccess = (transactionId: string) => {
    setPaymentComplete(true)
    toast.success('Thank you for your donation!')
    // Redirect to success page
    window.location.href = `/payment/success?transaction_id=${transactionId}&amount=${amount}`
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          eventId: eventId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      // Redirect to Braintree payment page
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  if (paymentComplete) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-lg font-semibold mb-2">
          Payment Successful!
        </div>
        <p className="text-gray-600">
          Thank you for your generous donation. You will receive a confirmation email shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="amount" className="text-base font-medium">Donation Amount (USD)</Label>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10, 25, 50, 100].map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset ? "default" : "outline"}
                onClick={() => setAmount(preset)}
                className={`${amount === preset ? "btn-primary" : "btn-secondary"} min-h-[44px] text-base`}
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
              onChange={(e) => setAmount(Number(e.target.value) || 0)} 
              type="number" 
              min="1" 
              step="1"
              className="w-24 min-h-[44px] text-base"
              required 
            />
            <span className="text-sm text-gray-600">USD</span>
          </div>
        </div>
      </div>
      
      {amount > 0 && (
        <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between mb-2"><span className="text-gray-700">Donation</span><span className="text-gray-900 font-medium">${amount.toFixed(2)}</span></div>
          <div className="flex justify-between mb-2"><span className="text-gray-700">Platform fee (8.99%)</span><span className="text-gray-900 font-medium">${(amount * 0.0899).toFixed(2)}</span></div>
          <div className="border-t border-blue-300 pt-2 flex justify-between font-bold"><span className="text-gray-900">Total charged</span><span className="text-blue-600">${(amount * 1.0899).toFixed(2)}</span></div>
          <p className="text-gray-600 mt-2">Using EventraiseHUB is free. A platform fee of 8.99% applies to donations received (plus Braintree processing fees).</p>
        </div>
      )}

      {amount > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Powered by Braintree • Supports PayPal, Venmo, Apple Pay, Google Pay
            </p>
            <Button 
              onClick={handleCheckout}
              className="w-full btn-primary min-h-[50px] text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
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
          <Suspense fallback={<div className="text-gray-600">Loading…</div>}>
            <DonationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}



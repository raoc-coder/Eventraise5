'use client'

import { useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { Heart, DollarSign } from 'lucide-react'
import Image from 'next/image'
import { useCurrency } from '@/app/providers/currency-provider'
import { PayPalDonationButton } from '@/lib/paypal-client'

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

  // PayPal flow handled by PayPalDonationButton

  if (paymentComplete) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-green-600 text-xl font-bold mb-3">
          Payment Successful!
        </div>
        <p className="text-gray-600 text-base leading-relaxed">
          Thank you for your generous donation. You will receive a confirmation email shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-1">
      {/* Donation Amount Section */}
      <div className="space-y-4">
        <div className="text-center">
          <Label className="text-lg font-semibold text-gray-900 mb-2 block">
            Choose Your Donation Amount
          </Label>
          <p className="text-sm text-gray-600">
            Select a preset amount or enter a custom amount
          </p>
        </div>

        {/* Preset Amount Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 5, 10, 25, 50, 100].map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={amount === preset ? "default" : "outline"}
              onClick={() => setAmount(preset)}
              className={`h-14 text-lg font-semibold ${
                amount === preset 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <DollarSign className="h-5 w-5 mr-1" />
              {preset}
            </Button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-3">
          <div className="text-center">
            <Label className="text-base font-medium text-gray-700">
              Or enter a custom amount
            </Label>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-gray-600 font-medium">$</span>
            <Input 
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value) || 0)} 
              type="number" 
              min="1" 
              step="1"
              className="w-32 h-12 text-lg font-semibold text-center border-2 border-gray-300 focus:border-blue-500"
              placeholder="0"
            />
            <span className="text-gray-600 font-medium">USD</span>
          </div>
        </div>
      </div>
      
      {/* Payment Summary */}
      {amount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Donation Amount</span>
              <span className="font-semibold text-gray-900">${amount.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-300 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">You’ll Be Charged</span>
                <span className="text-xl font-bold text-blue-600">${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 text-center leading-relaxed">
            Fees are deducted from your donation so the organizer receives the net amount.
          </div>
        </div>
      )}

      {/* PayPal Buttons */}
      {amount > 0 && (
        <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Secure payment powered by PayPal</p>
              <div className="flex justify-center">
                <Image
                  src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg"
                  alt="PayPal accepted"
                  width={111}
                  height={69}
                  className="h-8 w-auto"
                  priority
                />
              </div>
            </div>
          )}
          <PayPalDonationButton
            amount={amount}
            eventId={eventId || ''}
            onSuccess={() => handlePaymentSuccess('paypal')}
            onError={(err) => toast.error(err)}
            disabled={loading || amount < 1}
          />
        </div>
      )}
    </div>
  )
}

export default function NewDonationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Make a Donation
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Your generosity makes a difference
            </p>
          </CardHeader>
          
          <CardContent className="px-6 pb-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            }>
              <DonationForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
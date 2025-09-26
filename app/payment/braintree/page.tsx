'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
// import BraintreeCheckout from '@/components/payment/BraintreeCheckout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function BraintreePaymentContent() {
  const searchParams = useSearchParams()
  const requestId = searchParams?.get('request_id')
  const amount = searchParams?.get('amount')
  const [loading, setLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!requestId || !amount) {
        toast.error('Invalid payment request')
        setLoading(false)
        return
      }

      try {
        // Fetch payment request details
        const response = await fetch(`/api/braintree/payment-request/${requestId}`)
        if (response.ok) {
          const data = await response.json()
          setPaymentData(data)
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error)
        toast.error('Failed to load payment information')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [requestId, amount])

  const handlePaymentSuccess = (transactionId: string) => {
    toast.success('Payment successful!')
    // Redirect to success page
    window.location.href = `/payment/success?transaction_id=${transactionId}&amount=${amount}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    )
  }

  if (!requestId || !amount) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Error
            </CardTitle>
            <CardDescription>
              Invalid payment request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The payment request is invalid or has expired. Please try again.
            </p>
            <Link href="/events">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/events">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-600 mt-2">
          Secure payment powered by Braintree
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment System Temporarily Unavailable</CardTitle>
              <CardDescription>
                We&apos;re currently updating our payment system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-gray-600 text-lg font-semibold mb-2">
                  Payment System Under Maintenance
                </div>
                <p className="text-gray-500 mb-4">
                  We&apos;re currently updating our payment system. Please try again later.
                </p>
                <Button asChild>
                  <Link href="/">
                    Return to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>
                Review your payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-semibold">USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">Credit/Debit Card</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Secure Payment</h4>
                <p className="text-sm text-blue-700">
                  Your payment information is encrypted and secure. We use Braintree, 
                  a PayPal company, to process all payments safely.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BraintreePaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }>
        <BraintreePaymentContent />
      </Suspense>
    </div>
  )
}
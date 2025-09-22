'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { DonationConfirmation } from '@/components/payments/donation-confirmation'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const campaignId = searchParams.get('campaign')
  const amount = searchParams.get('amount')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your donation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DonationConfirmation
        campaignId={campaignId || undefined}
        amount={amount ? parseFloat(amount) : undefined}
        transactionId={sessionId || undefined}
        showShareOptions={true}
        showNextSteps={true}
      />
    </div>
  )
}

export default function PaymentSuccessPage() {
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
        <PaymentSuccessContent />
      </Suspense>
    </div>
  )
}

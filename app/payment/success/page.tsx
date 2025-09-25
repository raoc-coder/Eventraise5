'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'

const DonationConfirmation = dynamic(
  () => import('@/components/payments/donation-confirmation').then(m => m.DonationConfirmation),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    )
  }
)

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id') || null
  const campaignId = searchParams?.get('campaign') || null
  const amount = searchParams?.get('amount') || null
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

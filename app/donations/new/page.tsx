'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { DonationAmountForm } from '@/components/donations/DonationAmountForm'

function DonationFormWithParams() {
  const searchParams = useSearchParams()
  const eventIdParam = searchParams?.get('eventId') || undefined
  const personalCampaignIdParam =
    searchParams?.get('personalCampaignId') || undefined

  return (
    <DonationAmountForm
      eventIdParam={eventIdParam}
      personalCampaignIdParam={personalCampaignIdParam}
    />
  )
}

export default function NewDonationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 to-trust-100">
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card className="w-full border-0 bg-white/95 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-6 pt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-trust-600 to-trust-800">
              <Heart className="h-8 w-8 text-white" aria-hidden />
            </div>
            <CardTitle className="text-2xl font-bold text-trust-950">
              Make a Donation
            </CardTitle>
            <p className="mt-2 text-trust-700">
              Your generosity makes a difference
            </p>
          </CardHeader>

          <CardContent className="px-6 pb-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-b-2 border-trust-500"
                    role="status"
                    aria-label="Loading donation form"
                  />
                  <span className="ml-3 text-trust-700">Loading…</span>
                </div>
              }
            >
              <DonationFormWithParams />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

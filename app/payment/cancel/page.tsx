'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  Heart,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-gray-300 text-lg">
            Your donation was not completed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cancellation Details */}
          <Card className="card-soft">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <CardTitle className="text-white">Donation Cancelled</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                No charges were made to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-white">Payment process was cancelled</span>
              </div>
              <div className="flex items-center space-x-3">
                <Heart className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">No donation was processed</span>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-4 w-4 text-cyan-400" />
                <span className="text-white">You can try again anytime</span>
              </div>
            </CardContent>
          </Card>

          {/* Why Donate */}
          <Card className="card-soft">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-white">Your Support Matters</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Every donation makes a real difference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Your contribution helps fund important programs and initiatives
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Every dollar goes directly to the cause you&apos;re supporting
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">
                    You&apos;ll receive updates on how your donation is being used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <div className="mt-8">
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Need Help?</CardTitle>
              <CardDescription className="text-gray-300">
                If you encountered any issues, we&apos;re here to help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Common Issues</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Payment method not accepted</li>
                    <li>• Browser security settings</li>
                    <li>• Network connectivity issues</li>
                    <li>• Card declined by bank</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Solutions</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Try a different payment method</li>
                    <li>• Check your browser settings</li>
                    <li>• Ensure stable internet connection</li>
                    <li>• Contact your bank if needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {campaignId && (
            <Link href={`/campaigns/${campaignId}`}>
              <Button className="btn-primary">
                Try Again
                <RefreshCw className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
          <Link href="/events">
            <Button variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10">
              Browse Other Campaigns
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-gray-300 text-lg">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}

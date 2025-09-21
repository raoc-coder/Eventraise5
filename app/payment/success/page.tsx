'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { 
  CheckCircle, 
  Heart, 
  Sparkles, 
  Gift, 
  Share2, 
  ArrowRight,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const campaignId = searchParams.get('campaign')
  const [donationDetails, setDonationDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // In a real app, you might want to fetch donation details
      // For now, we'll just show a success message
      setLoading(false)
    }
  }, [sessionId])

  const shareOnSocial = (platform: string) => {
    const text = "I just made a donation to support a great cause! Join me in making a difference. 💙"
    const url = window.location.origin
    
    let shareUrl = ''
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-white">Processing your donation...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Thank You! 🎉</h1>
          <p className="text-gray-300 text-lg">
            Your donation has been successfully processed
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Success Details */}
          <Card className="card-soft">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-white">Donation Confirmed</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Your generous contribution is making a real difference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-white">Payment processed successfully</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-white">Receipt sent to your email</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-white">Tax-deductible receipt available</span>
              </div>
            </CardContent>
          </Card>

          {/* Share Your Impact */}
          <Card className="card-soft">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-white">Share Your Impact</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Help spread the word and inspire others to give
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                Share your donation on social media to inspire others to support this cause too!
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('twitter')}
                  className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('facebook')}
                  className="text-blue-600 border-blue-600/50 hover:bg-blue-600/10"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('linkedin')}
                  className="text-blue-700 border-blue-700/50 hover:bg-blue-700/10"
                >
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mt-8 text-center">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">What&apos;s Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="text-white font-medium">Stay Updated</h4>
                <p className="text-gray-400 text-sm">Get updates on the campaign progress</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Share2 className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="text-white font-medium">Spread the Word</h4>
                <p className="text-gray-400 text-sm">Share with friends and family</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Gift className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-white font-medium">Make Another Gift</h4>
                <p className="text-gray-400 text-sm">Support more causes you care about</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/events">
            <Button className="btn-primary">
              Browse More Campaigns
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          {campaignId && (
            <Link href={`/campaigns/${campaignId}`}>
              <Button variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10">
                View Campaign
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

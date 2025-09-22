'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Heart, 
  Sparkles, 
  Gift, 
  Share2, 
  ArrowRight,
  Star,
  Mail,
  Receipt,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface DonationConfirmationProps {
  campaignId?: string
  amount?: number
  donorName?: string
  transactionId?: string
  showShareOptions?: boolean
  showNextSteps?: boolean
}

export function DonationConfirmation({
  campaignId,
  amount,
  donorName,
  transactionId,
  showShareOptions = true,
  showNextSteps = true
}: DonationConfirmationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animate in the confirmation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const shareOnSocial = (platform: string) => {
    const text = "I just made a donation to support a great cause through EventraiseHUB! Join me in making a difference. 💙"
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

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
          <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <h1 className="display text-gray-900 mb-2">Thank You! 🎉</h1>
        <p className="text-gray-600 text-lg">
          Your generous donation has been successfully processed through EventraiseHUB
        </p>
        {donorName && (
          <p className="text-gray-500 mt-2">Thank you, {donorName}!</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Success Details */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-600" />
              <CardTitle className="text-gray-900">Donation Confirmed</CardTitle>
            </div>
            <CardDescription className="text-gray-600">
              Your generous contribution is making a real difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {amount && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <span className="text-gray-700">Donation Amount</span>
                <span className="text-2xl font-bold text-green-600">${amount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-gray-700">Payment processed successfully</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700">Confirmation email sent</span>
              </div>
              <div className="flex items-center space-x-3">
                <Receipt className="h-4 w-4 text-purple-500" />
                <span className="text-gray-700">Receipt sent to your email</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-700">Tax-deductible receipt available</span>
              </div>
            </div>

            {transactionId && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Transaction ID:</strong> {transactionId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Your Impact */}
        {showShareOptions && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-gray-900">Share Your Impact</CardTitle>
              </div>
              <CardDescription className="text-gray-600">
                Help spread the word and inspire others to give
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Share your donation on social media to inspire others to support this cause too!
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('twitter')}
                  className="text-blue-400 border-blue-400 hover:bg-blue-50"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('facebook')}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOnSocial('linkedin')}
                  className="text-blue-700 border-blue-700 hover:bg-blue-50"
                >
                  LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps */}
      {showNextSteps && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">What&apos;s Next?</h3>
            <p className="text-gray-600">Here&apos;s how you can continue making an impact</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-gray-900 font-medium mb-2">Stay Updated</h4>
              <p className="text-gray-600 text-sm">Get updates on the campaign progress and impact</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-gray-900 font-medium mb-2">Spread the Word</h4>
              <p className="text-gray-600 text-sm">Share with friends and family to amplify impact</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-gray-900 font-medium mb-2">Make Another Gift</h4>
              <p className="text-gray-600 text-sm">Support more causes you care about</p>
            </div>
          </div>
        </div>
      )}

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
            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
              View Campaign
            </Button>
          </Link>
        )}
        <Link href="/dashboard">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            My Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

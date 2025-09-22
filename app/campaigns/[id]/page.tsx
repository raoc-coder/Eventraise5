'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { DonationForm } from '@/components/payments/donation-form'
import { 
  Heart, 
  Share2, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin,
  Target,
  TrendingUp,
  Star
} from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  description: string
  goal_amount: number
  current_amount: number
  start_date: string
  end_date: string
  organization_name: string
  category: string
  image_url?: string
  is_featured: boolean
}

export default function CampaignDetailPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCampaign(data.campaign)
        } else {
          console.error('Failed to fetch campaign:', response.statusText)
          setCampaign(null)
        }
      } catch (error) {
        console.error('Error fetching campaign:', error)
        setCampaign(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaign()
  }, [params.id])

  const getProgressPercentage = (current: number, goal: number) => {
    return (current / goal) * 100
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: `Support ${campaign?.title} on EventraiseHub`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h1>
          <Link href="/events">
            <Button className="btn-primary">Browse Campaigns</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">{campaign.title}</CardTitle>
                    <p className="text-gray-300">{campaign.organization_name}</p>
                    {campaign.is_featured && (
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 text-sm font-medium">Featured Campaign</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Starts: {formatDate(campaign.start_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Ends: {formatDate(campaign.end_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      <span>{campaign.category}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">About This Campaign</h3>
                    <p className="text-gray-300 leading-relaxed">{campaign.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Recent Donations</CardTitle>
                <CardDescription className="text-gray-300">
                  Thank you to our generous supporters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">J</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">John Smith</p>
                        <p className="text-gray-400 text-sm">1 hour ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">$500</p>
                      <p className="text-gray-400 text-sm">Amazing cause!</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">A</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Anonymous</p>
                        <p className="text-gray-400 text-sm">2 hours ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">$100</p>
                      <p className="text-gray-400 text-sm">Thank you for this amazing cause!</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">S</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Sarah Johnson</p>
                        <p className="text-gray-400 text-sm">5 hours ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">$250</p>
                      <p className="text-gray-400 text-sm">Happy to support our school!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <DonationForm
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            goalAmount={campaign.goal_amount}
            currentAmount={campaign.current_amount}
          />

          {/* Progress Card */}
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Campaign Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Raised</span>
                  <span className="text-cyan-400 font-bold">${campaign.current_amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(getProgressPercentage(campaign.current_amount, campaign.goal_amount), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Goal</span>
                  <span className="text-gray-300">${campaign.goal_amount.toLocaleString()}</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">
                    {getProgressPercentage(campaign.current_amount, campaign.goal_amount).toFixed(0)}%
                  </p>
                  <p className="text-gray-400 text-sm">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

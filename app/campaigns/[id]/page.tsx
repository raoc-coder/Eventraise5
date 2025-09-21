'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Heart, 
  Share2, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin,
  Target,
  TrendingUp,
  Gift,
  Star
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
  const [donationAmount, setDonationAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Mock data for demonstration
    const mockCampaign: Campaign = {
      id: params.id as string,
      title: 'Spring School Playground Renovation',
      description: 'Help us create a safe and fun playground for our students. We need to replace old equipment, add new play structures, and improve safety surfacing.',
      goal_amount: 25000,
      current_amount: 18750,
      start_date: '2024-03-01T00:00:00Z',
      end_date: '2024-06-30T23:59:59Z',
      organization_name: 'Lincoln Elementary School',
      category: 'Education',
      is_featured: true
    }
    
    setTimeout(() => {
      setCampaign(mockCampaign)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount')
      return
    }
    
    // Here you would integrate with Stripe payment processing
    toast.success(`Thank you for your donation of $${donationAmount}!`)
    setDonationAmount('')
    setDonorName('')
    setDonorEmail('')
    setMessage('')
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
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading campaign...</p>
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
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                  EventraiseHub
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Browse Campaigns</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
                        <Star className="h-4 w-4 text-orange-400 mr-1" />
                        <span className="text-sm text-orange-400 font-semibold">Featured Campaign</span>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleShare} variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">{campaign.description}</p>
                
                {/* Campaign Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Calendar className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Ends</p>
                      <p className="text-white font-semibold">{formatDate(campaign.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Target className="h-5 w-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="text-white font-semibold">{campaign.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Users className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Donors</p>
                      <p className="text-white font-semibold">127</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
          <div className="space-y-6">
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Make a Donation</CardTitle>
                <CardDescription className="text-gray-300">
                  Support this campaign and help make a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDonation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-gray-300">Donation Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      {[25, 50, 100, 250].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDonationAmount(amount.toString())}
                          className="text-cyan-400 hover:bg-cyan-500/20"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      disabled={isAnonymous}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      disabled={isAnonymous}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300">Message (Optional)</Label>
                    <textarea
                      id="message"
                      placeholder="Leave a message of support..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <Label htmlFor="anonymous" className="text-gray-300">Donate anonymously</Label>
                  </div>

                  <Button type="submit" className="w-full btn-primary">
                    <Gift className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>
                </form>
              </CardContent>
            </Card>

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
                      className="bg-gradient-to-r from-cyan-400 to-orange-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(campaign.current_amount, campaign.goal_amount)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Goal</span>
                    <span className="text-white font-bold">${campaign.goal_amount.toLocaleString()}</span>
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
    </div>
  )
}

'use client'

import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Plus,
  Heart,
  Sparkles,
  Star,
  Zap,
  Gift,
  Target,
  Award,
  Bell
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="relative">
            <Heart className="h-16 w-16 text-cyan-400 bounce-animation mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-orange-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-white font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Manage your fundraising campaigns and events</p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <Card className="card-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to EventraiseHub</h2>
                <p className="text-gray-300 mb-4">Create and manage your direct donation campaigns</p>
                <Link href="/events/create">
                  <Button className="btn-primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Campaign
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-300">Manage your fundraising campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/events/create">
                <Button className="w-full justify-start btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Campaign
                </Button>
              </Link>
              <Link href="/events/mine">
                <Button variant="outline" className="w-full justify-start btn-secondary">
                  <Calendar className="mr-2 h-4 w-4" />
                  My Campaigns
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="w-full justify-start btn-secondary">
                  <Heart className="mr-2 h-4 w-4" />
                  Browse Campaigns
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white">Getting Started</CardTitle>
              <CardDescription className="text-gray-300">Learn how to create effective campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <Target className="h-5 w-5 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Set Clear Goals</p>
                    <p className="text-xs text-gray-300">Define specific fundraising targets for your campaign</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Heart className="h-5 w-5 text-orange-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Share Your Story</p>
                    <p className="text-xs text-gray-300">Connect with donors through compelling descriptions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Zap className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Easy Donations</p>
                    <p className="text-xs text-gray-300">Accept secure donations with just a few clicks</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

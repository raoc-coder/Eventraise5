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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-800">Create, share, and manage your events</p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Welcome to EventraiseHub</h2>
                <p className="text-gray-800 mb-4">Create and manage your events</p>
                <Link href="/events/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              <CardDescription className="text-gray-800">Start a new event or jump back into your work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/events/create">
                <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Event
                </Button>
              </Link>
              <Link href="/events/mine">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <Calendar className="mr-2 h-5 w-5" />
                  My Events
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  <Heart className="mr-2 h-5 w-5" />
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Getting Started</CardTitle>
              <CardDescription className="text-gray-800">Learn how to create effective events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Set Clear Goals</p>
                    <p className="text-sm text-gray-800">Define specific goals and targets for your event</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Share Your Story</p>
                    <p className="text-sm text-gray-800">Connect with donors through compelling descriptions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-lg bg-green-50 border border-green-200">
                  <Zap className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Easy Donations</p>
                    <p className="text-sm text-gray-800">Accept secure donations with just a few clicks</p>
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

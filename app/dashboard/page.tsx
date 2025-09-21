'use client'

import { useAuth } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <Heart className="h-16 w-16 text-pink-500 bounce-animation mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gradient font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EventRaise</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.user_metadata?.full_name || user.email}</span>
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">Profile</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your fundraising campaigns and events</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$12,345</div>
              <p className="text-xs text-gray-500">+20.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">3</div>
              <p className="text-xs text-gray-500">2 ending this week</p>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Volunteers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">24</div>
              <p className="text-xs text-gray-500">+4 new this week</p>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Donations</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">156</div>
              <p className="text-xs text-gray-500">+12% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              <CardDescription>Get started with your fundraising</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/events/create">
                <Button className="w-full justify-start btn-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </Link>
              <Link href="/volunteers">
                <Button variant="outline" className="w-full justify-start btn-secondary">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Volunteers
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start btn-secondary">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900">Recent Activity</CardTitle>
              <CardDescription>Latest updates on your campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New donation received</p>
                    <p className="text-xs text-gray-500">$50 for Spring Walkathon</p>
                  </div>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Volunteer signed up</p>
                    <p className="text-xs text-gray-500">Sarah Johnson for Auction Setup</p>
                  </div>
                  <span className="text-xs text-gray-400">4h ago</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-yellow-50 transition-colors">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Event milestone reached</p>
                    <p className="text-xs text-gray-500">75% of goal for Charity Run</p>
                  </div>
                  <span className="text-xs text-gray-400">1d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

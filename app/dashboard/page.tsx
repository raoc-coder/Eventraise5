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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Fun Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="relative">
                <Heart className="h-8 w-8 text-pink-500 bounce-animation" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="ml-2 text-xl font-bold text-gradient">EventRaise</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.user_metadata?.full_name || user.email} 👋</span>
              <Button variant="ghost" size="sm" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">Profile</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h1 className="text-3xl font-bold text-gradient">Dashboard 🎯</h1>
            <Star className="h-6 w-6 text-yellow-400 ml-2 bounce-animation" />
          </div>
          <p className="text-gray-600">Manage your fundraising campaigns and events ✨</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gradient-success">Total Raised 💰</CardTitle>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                <TrendingUp className="h-3 w-3 text-green-400 bounce-animation" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-success">$12,345</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month 🚀</p>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gradient">Active Events 📅</CardTitle>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                <Bell className="h-3 w-3 text-blue-400 bounce-animation" style={{animationDelay: '0.5s'}} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient">3</div>
              <p className="text-xs text-muted-foreground">2 ending this week ⏰</p>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gradient-warm">Volunteers 👥</CardTitle>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-pink-500 mr-1" />
                <Heart className="h-3 w-3 text-pink-400 bounce-animation" style={{animationDelay: '1s'}} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-warm">24</div>
              <p className="text-xs text-muted-foreground">+4 new this week 🎉</p>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gradient-success">Donations 🎁</CardTitle>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <Gift className="h-3 w-3 text-green-400 bounce-animation" style={{animationDelay: '1.5s'}} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-success">156</div>
              <p className="text-xs text-muted-foreground">+12% from last month 📈</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-soft hover:card-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gradient">Quick Actions ⚡</CardTitle>
              <CardDescription>Get started with your fundraising</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/events/create">
                <Button className="w-full justify-start btn-fun-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Event 🎯
                </Button>
              </Link>
              <Link href="/volunteers">
                <Button variant="outline" className="w-full justify-start hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Volunteers 👥
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-300">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Reports 📊
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-soft hover:card-glow transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gradient-warm">Recent Activity 🔔</CardTitle>
              <CardDescription>Latest updates on your campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="w-3 h-3 bg-green-500 rounded-full pulse-glow"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New donation received 💰</p>
                    <p className="text-xs text-gray-500">$50 for Spring Walkathon</p>
                  </div>
                  <span className="text-xs text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="w-3 h-3 bg-blue-500 rounded-full pulse-glow"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Volunteer signed up 👥</p>
                    <p className="text-xs text-gray-500">Sarah Johnson for Auction Setup</p>
                  </div>
                  <span className="text-xs text-gray-400">4h ago</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-yellow-50 transition-colors">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full pulse-glow"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Event milestone reached 🎯</p>
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

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Zap,
  Gift,
  Target,
  Award
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Neon Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                  EventraiseHub
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="btn-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-orange-500 bg-clip-text text-transparent">
              Raise More. Stress Less. Celebrate Together.
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create powerful fundraising events, manage volunteers, and track progress in real-time. 
            Everything you need to make your cause successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="btn-primary w-full sm:w-auto">
                Start Your Campaign
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" size="lg" className="btn-secondary w-full sm:w-auto">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                Everything You Need to Succeed
              </span>
            </h2>
            <p className="text-lg text-gray-300">
              Powerful tools designed for modern fundraising
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <Calendar className="h-8 w-8 text-cyan-400 mb-4" />
                <CardTitle className="text-white">Event Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Create walk-a-thons, auctions, product sales, direct donations, and raffles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <Users className="h-8 w-8 text-orange-400 mb-4" />
                <CardTitle className="text-white">Volunteer Management</CardTitle>
                <CardDescription className="text-gray-300">
                  Sign-up sheets, automated reminders, and shift scheduling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <DollarSign className="h-8 w-8 text-cyan-400 mb-4" />
                <CardTitle className="text-white">Payment Processing</CardTitle>
                <CardDescription className="text-gray-300">
                  Credit cards, ACH, mobile wallets with Stripe integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-orange-400 mb-4" />
                <CardTitle className="text-white">Real-time Tracking</CardTitle>
                <CardDescription className="text-gray-300">
                  Live leaderboards, progress goals, and donor recognition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-cyan-400 mb-4" />
                <CardTitle className="text-white">Promotion Tools</CardTitle>
                <CardDescription className="text-gray-300">
                  Email, SMS, and social media integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-orange-400 mb-4" />
                <CardTitle className="text-white">Reports & Analytics</CardTitle>
                <CardDescription className="text-gray-300">
                  Financial summaries, tax receipts, and compliance-ready reports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-500/20 to-orange-500/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of organizations already using EventraiseHub
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="btn-primary">
              Start Your First Campaign
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                    EventraiseHub
                  </span>
                </div>
              </div>
              <p className="text-gray-400">
                Empowering organizations to raise more and impact more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EventRaise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Fun Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-3xl pulse-glow"></div>
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
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="btn-fun-primary">Get Started ✨</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative inline-block mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-4">
              Raise More, Impact More
            </h1>
            <div className="absolute -top-2 -right-2">
              <Star className="h-8 w-8 text-yellow-400 bounce-animation" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Zap className="h-6 w-6 text-blue-500 bounce-animation" style={{animationDelay: '1s'}} />
            </div>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create powerful fundraising events, manage volunteers, and track progress in real-time. 
            Everything you need to make your cause successful. 🚀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="btn-fun-primary w-full sm:w-auto">
                Start Your Campaign 🎯
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" size="lg" className="w-full sm:w-auto hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                Browse Events 🔍
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Everything You Need to Succeed ✨
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools designed for modern fundraising
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                  <Gift className="h-6 w-6 text-pink-500 bounce-animation" />
                </div>
                <CardTitle className="text-gradient">Event Management</CardTitle>
                <CardDescription>
                  Create walk-a-thons, auctions, product sales, direct donations, and raffles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-green-500 mr-3" />
                  <Heart className="h-6 w-6 text-red-500 bounce-animation" style={{animationDelay: '0.5s'}} />
                </div>
                <CardTitle className="text-gradient-success">Volunteer Management</CardTitle>
                <CardDescription>
                  Sign-up sheets, automated reminders, and shift scheduling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                  <TrendingUp className="h-6 w-6 text-yellow-500 bounce-animation" style={{animationDelay: '1s'}} />
                </div>
                <CardTitle className="text-gradient-success">Payment Processing</CardTitle>
                <CardDescription>
                  Credit cards, ACH, mobile wallets with Stripe integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                  <Target className="h-6 w-6 text-orange-500 bounce-animation" style={{animationDelay: '1.5s'}} />
                </div>
                <CardTitle className="text-gradient-warm">Real-time Tracking</CardTitle>
                <CardDescription>
                  Live leaderboards, progress goals, and donor recognition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <Smartphone className="h-8 w-8 text-indigo-500 mr-3" />
                  <Zap className="h-6 w-6 text-blue-500 bounce-animation" style={{animationDelay: '2s'}} />
                </div>
                <CardTitle className="text-gradient">Promotion Tools</CardTitle>
                <CardDescription>
                  Email, SMS, and social media integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-8 w-8 text-teal-500 mr-3" />
                  <Award className="h-6 w-6 text-yellow-500 bounce-animation" style={{animationDelay: '2.5s'}} />
                </div>
                <CardTitle className="text-gradient-success">Reports & Analytics</CardTitle>
                <CardDescription>
                  Financial summaries, tax receipts, and compliance-ready reports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="relative inline-block mb-6">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make a Difference? 🌟
            </h2>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-300 bounce-animation" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Heart className="h-5 w-5 text-pink-300 bounce-animation" style={{animationDelay: '1s'}} />
            </div>
          </div>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of organizations already using EventRaise 🚀
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="btn-fun-secondary">
              Start Your First Campaign 🎯
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative">
                  <Heart className="h-6 w-6 text-pink-400 bounce-animation" />
                  <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="ml-2 text-lg font-bold text-gradient">EventRaise</span>
              </div>
              <p className="text-gray-400">
                Empowering organizations to raise more and impact more. 💖
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gradient">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features ✨</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing 💰</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations 🔗</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gradient-success">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center 🆘</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact 📞</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status 📊</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gradient-warm">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About 🏢</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog 📝</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers 💼</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EventRaise. All rights reserved. Made with 💖</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
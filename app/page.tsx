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
  Award,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              <span className="text-xl font-bold text-gray-900">
                EventraiseHUB
              </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">Events</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="btn-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="display text-gray-900 mb-6">
              Raise More. Stress Less.{' '}
              <span className="text-gradient">Celebrate Together.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate EventraiseHUB platform for schools and parents to manage fundraising events, 
              track progress, and build stronger communities with energy and impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button className="btn-primary text-lg px-8 py-4">
                  Start Your First Campaign
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="secondary" className="text-lg px-8 py-4">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Fundraise Successfully
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From event planning to payment processing, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="event-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-gray-900">Event Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Create and manage fundraising events with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Walk-a-thons & Fun Runs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Silent Auctions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Product Sales
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="event-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-charcoal">Payment Processing</CardTitle>
                <CardDescription className="text-slate">
                  Secure, fast, and reliable payment collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Credit Card & ACH
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Mobile Wallets
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Tax Receipts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="event-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-charcoal">Volunteer Management</CardTitle>
                <CardDescription className="text-slate">
                  Organize volunteers and track participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Sign-up Sheets
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Shift Scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Automated Reminders
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="event-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-charcoal">Real-time Tracking</CardTitle>
                <CardDescription className="text-slate">
                  Monitor progress and celebrate milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Progress Dashboards
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Leaderboards
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Goal Tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="event-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-charcoal">Mobile Optimized</CardTitle>
                <CardDescription className="text-slate">
                  Access everything from any device, anywhere
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Responsive Design
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Mobile Payments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Push Notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="event-card">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-charcoal">Secure & Compliant</CardTitle>
                <CardDescription className="text-slate">
                  Bank-level security with full compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    PCI DSS Compliant
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Data Encryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-green mr-2" />
                    Audit Reports
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Schools Nationwide
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how schools are raising more with Event Raise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="event-card text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">$2.5M+</h3>
                <p className="text-gray-600">Raised by our community</p>
              </CardContent>
            </Card>

            <Card className="event-card text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Schools using Event Raise</p>
              </CardContent>
            </Card>

            <Card className="event-card text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">4.9/5</h3>
                <p className="text-gray-600">Average user rating</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Raise More for Your School?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of schools already using Event Raise to create amazing fundraising experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="btn-primary text-lg px-8 py-4">
                Start Your First Campaign
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="secondary" className="text-lg px-8 py-4">
                See Examples
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Event Raise</span>
              </div>
              <p className="text-gray-400">
                Empowering schools to raise more and build stronger communities.
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
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Event Raise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
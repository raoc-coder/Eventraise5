import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/layout/navigation'
import { 
  Heart, 
  TrendingUp, 
  Shield,
  Smartphone,
  Star,
  ArrowRight,
  CheckCircle,
  Share2
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-trust-50/35 to-white no-overflow">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(46,79,115,0.12),transparent)]"
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 relative">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-trust-950 mb-2 sm:mb-3 leading-tight tracking-tight">
              Raise More. Stress Less.
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-action-500 via-action-600 to-action-500 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              Celebrate Together.
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
              The all-in-one event management platform for <strong>volunteers</strong>, <strong>fundraisers</strong>, <strong>schools</strong>, <strong>parents</strong>, <strong>organizations</strong>, and <strong>trade shows</strong>. Create donation drives, ticketed events, RSVPs, volunteer signups, and sponsorships with built-in PayPal payments, registrations, and real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center px-4">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="mobile">
                  Create Event
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/events" className="w-full sm:w-auto">
                <Button variant="outline" size="mobile">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-trust-950 mb-4 tracking-tight">
              Everything You Need for Fundraising Donation, Event, and Volunteer Management
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4 leading-relaxed">
              From event planning to secure payment processing, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-trust-600 to-trust-800 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md shadow-trust-900/15">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-trust-950">Event Creation</CardTitle>
                <CardDescription className="text-gray-600">
                  Create and manage all types of events with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Simple Campaign Setup
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Goal Setting & Tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Campaign Sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-trust-700 to-trust-900 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md shadow-trust-900/20">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-trust-950">Secure Payments</CardTitle>
                <CardDescription className="text-gray-600">
                  Secure, fast, and reliable donation processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    PayPal Payments (Cards, PayPal, Venmo, Pay Later)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Instant Capture & Receipts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Transparent Fees (8.99% platform)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-action-500 to-action-600 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md shadow-action-600/25">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-trust-950">Easy Sharing</CardTitle>
                <CardDescription className="text-gray-600">
                  Share your events across multiple channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-action-600 mr-2 shrink-0" />
                    Social Media Integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-action-600 mr-2 shrink-0" />
                    Email Campaigns
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-action-600 mr-2 shrink-0" />
                    Direct Links
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-action-500 to-action-700 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md shadow-action-700/25">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-trust-950">Real-time Tracking</CardTitle>
                <CardDescription className="text-gray-600">
                  Monitor progress and celebrate milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-action-600 mr-2 shrink-0" />
                    Progress Dashboards
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-action-600 mr-2 shrink-0" />
                    Donation Analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-action-600 mr-2 shrink-0" />
                    Goal Tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-trust-500 to-trust-700 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md shadow-trust-900/15">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-trust-950">Mobile Optimized</CardTitle>
                <CardDescription className="text-gray-600">
                  Access everything from any device, anywhere
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Responsive Design
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Mobile Donations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Easy Sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="event-card border-trust-200/80">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-trust-800 to-trust-950 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md shadow-trust-950/25">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-trust-950">Secure & Compliant</CardTitle>
                <CardDescription className="text-gray-600">
                  Bank-level security with full compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    PCI DSS Compliant
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Data Encryption
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-trust-600 mr-2 shrink-0" />
                    Secure Processing
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Discover / Trusted by */}
      <section
        className="py-20 bg-trust-900 text-white relative overflow-hidden"
        id="discover"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,rgba(249,115,22,0.14),transparent)]"
          aria-hidden
        />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
              Trusted by Organizations Nationwide
            </h2>
            <p className="text-lg text-trust-200 max-w-2xl mx-auto leading-relaxed">
              See how organizations are raising more with EventraiseHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="event-card text-center border-trust-200/30 bg-white/98 shadow-lg shadow-trust-950/20">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-action-500 to-action-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-action-900/20">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-trust-950 mb-2">$800,000</h3>
                <p className="text-slate-600">Raised by our community</p>
              </CardContent>
            </Card>

            <Card className="event-card text-center border-trust-200/30 bg-white/98 shadow-lg shadow-trust-950/20">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-action-500 to-action-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-action-900/20">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-trust-950 mb-2">4.9/5</h3>
                <p className="text-slate-600">Average user rating</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 border-t border-trust-100/80 bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-trust-950 mb-4 tracking-tight">
            Ready to Launch Your Next Event?
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 px-4 leading-relaxed">
            Join teams and organizers using EventraiseHub for donations, ticketing, RSVPs, volunteers, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="mobile">
                Create Event
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <Button variant="outline" size="mobile">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer is now part of RootLayout */}
    </div>
  )
}
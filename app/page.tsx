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
  Smartphone
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EventRaise</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Raise More, Impact More
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create powerful fundraising events, manage volunteers, and track progress in real-time. 
            Everything you need to make your cause successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Campaign
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600">
              Powerful tools designed for modern fundraising
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary-600 mb-4" />
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Create walk-a-thons, auctions, product sales, direct donations, and raffles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary-600 mb-4" />
                <CardTitle>Volunteer Management</CardTitle>
                <CardDescription>
                  Sign-up sheets, automated reminders, and shift scheduling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-primary-600 mb-4" />
                <CardTitle>Payment Processing</CardTitle>
                <CardDescription>
                  Credit cards, ACH, mobile wallets with Stripe integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary-600 mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>
                  Live leaderboards, progress goals, and donor recognition
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary-600 mb-4" />
                <CardTitle>Promotion Tools</CardTitle>
                <CardDescription>
                  Email, SMS, and social media integrations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary-600 mb-4" />
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>
                  Financial summaries, tax receipts, and compliance-ready reports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of organizations already using EventRaise
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary">
              Start Your First Campaign
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Heart className="h-6 w-6 text-primary-400" />
                  <span className="ml-2 text-lg font-bold">EventRaise</span>
                </div>
                <p className="text-gray-400">
                  Empowering organizations to raise more and impact more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/features">Features</Link></li>
                  <li><Link href="/pricing">Pricing</Link></li>
                  <li><Link href="/integrations">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/help">Help Center</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/status">Status</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/about">About</Link></li>
                  <li><Link href="/blog">Blog</Link></li>
                  <li><Link href="/careers">Careers</Link></li>
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

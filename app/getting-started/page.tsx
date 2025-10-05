import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  CheckCircle, 
  ArrowRight, 
  UserPlus, 
  Mail, 
  Plus, 
  Share2, 
  CreditCard, 
  BarChart3 
} from 'lucide-react'
import Link from 'next/link'

export default function GettingStartedPage() {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Sign Up",
      description: "Go to EventRaiseHUB.com and click \"Sign Up.\"",
      details: "Create your account with just your email address and a secure password. No credit card required to get started.",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: 2,
      icon: Mail,
      title: "Confirm Your Email",
      description: "Confirm your email to activate your account.",
      details: "Check your inbox for a confirmation email and click the verification link to activate your account.",
      color: "from-green-500 to-green-600"
    },
    {
      number: 3,
      icon: Plus,
      title: "Create Your First Event",
      description: "Click \"Create Your First Event\" and fill in event details.",
      details: "Choose your event type (donation, ticketed, RSVP, volunteer, or sponsorship), add your event details, set your fundraising goal, and upload an image or description.",
      color: "from-purple-500 to-purple-600"
    },
    {
      number: 4,
      icon: Share2,
      title: "Publish and Share",
      description: "Publish and share your event link.",
      details: "Once you&apos;re satisfied with your event details, click \"Publish\" to make it live. You&apos;ll receive a unique shareable link to distribute to your community.",
      color: "from-pink-500 to-pink-600"
    },
    {
      number: 5,
      icon: CreditCard,
      title: "Collect Donations",
      description: "Collect donations or registrations securely via PayPal.",
      details: "All transactions are processed securely through PayPal, supporting credit/debit cards, PayPal, Venmo, and Pay Later options. Receipts are issued automatically.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      number: 6,
      icon: BarChart3,
      title: "Track Progress",
      description: "Track your progress and download reports anytime.",
      details: "Monitor your fundraising progress in real-time with easy-to-read analytics, progress charts, and detailed reports. Download data anytime for your records.",
      color: "from-indigo-500 to-indigo-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Getting Started Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Follow these simple steps to create your first event and start fundraising in minutes. 
            EventRaiseHUB makes it easy for anyone to organize successful fundraising campaigns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faqs">
              <Button variant="outline" size="lg" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                View FAQs
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-5 rounded-full -mr-16 -mt-16`}></div>
              <CardHeader className="relative">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg mr-4`}>
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-md`}>
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-gray-700 font-medium mb-3">{step.description}</p>
                <p className="text-gray-600 leading-relaxed">{step.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                Why Choose EventRaiseHUB?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All-in-one platform for every type of event</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Secure PayPal payment processing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Real-time analytics and reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Mobile-optimized for all devices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Bank-level security and encryption</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Free to use with transparent pricing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Our support team is here to help you succeed with your fundraising goals. 
                Get started today and join thousands of successful organizers.
              </p>
              <div className="space-y-4">
                <Link href="/faqs">
                  <Button variant="outline" className="w-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50">
                    Browse FAQs
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    Start Your First Event
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Join thousands of successful organizers who trust EventRaiseHUB for their fundraising needs.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, ArrowRight } from 'lucide-react'

export default function FAQsPage() {
  const faqs = [
    {
      question: "What is EventraiseHub?",
      answer: "EventraiseHub is an all-in-one event management platform that helps schools, nonprofits, and community groups organize donation drives, ticketed events, volunteer signups, sponsorships, and more — all in one place."
    },
    {
      question: "How do I get started?",
      answer: "Click \"Sign Up\" on the homepage to create your account. Once you confirm your email, you can immediately start your event."
    },
    {
      question: "How do I create an event?",
      answer: "After logging in, go to \"Create Event.\" Choose your event type (donation, ticketed, RSVP, volunteer, or sponsorship), enter your event details, fundraising goal, and upload an image or description. Then click \"Publish.\""
    },
    {
      question: "How are donations and payments handled?",
      answer: "All transactions are processed securely through PayPal, which supports credit/debit cards, PayPal, Venmo, and Pay Later options. Each donation is confirmed instantly and receipts are issued automatically."
    },
    {
      question: "What are the fees?",
      answer: "EventraiseHub is free to use. A platform fee of 8.99% is applied only to donations to cover payment processing, data storage, and platform maintenance costs."
    },
    {
      question: "How do I share my event?",
      answer: "Once your event is published, you&apos;ll receive a unique shareable link. You can share it through social media, email campaigns, or directly with your community."
    },
    {
      question: "Can I track donations and ticket sales?",
      answer: "Yes. Your dashboard provides real-time tracking of donations, tickets, and volunteer signups with easy-to-read analytics and progress charts."
    },
    {
      question: "Is the platform secure?",
      answer: "Absolutely. EventraiseHub uses bank-level encryption, is PCI DSS compliant, and ensures your organization&apos;s and donors&apos; data are always protected."
    },
    {
      question: "Can I access my dashboard on mobile?",
      answer: "Yes. The platform is fully mobile-optimized, allowing organizers and donors to manage and contribute from any device."
    },
    {
      question: "Who can use EventraiseHub?",
      answer: "Parents, teachers, volunteers, and community leaders — anyone organizing fundraising or participation-based events for schools or nonprofits."
    },
    {
      question: "How does cash out work?",
      answer: "After your event concludes, you can request a cash out from the Organizer Payouts page using the \"Request Cash Out\" button on a payout. Cash outs are currently processed manually by our team via your selected method (PayPal, Venmo, or ACH). You’ll be notified when the transfer has been initiated."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about EventraiseHub to get started with your fundraising and event management.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
              <p className="text-gray-600 mb-6">
                Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/getting-started" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Getting Started Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a 
                  href="/auth/register" 
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
                >
                  Create Account
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

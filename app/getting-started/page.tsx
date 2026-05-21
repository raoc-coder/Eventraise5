import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Plus,
  Share2,
  CreditCard,
  BarChart3,
  Users,
  Gavel,
  Bell,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Getting Started — EventraiseHub",
  description:
    "Set up your organization account, publish events, run peer-to-peer fundraising, and mobile auctions on EventraiseHub.",
};

export default function GettingStartedPage() {
  const steps = [
    {
      number: 1,
      icon: Smartphone,
      title: "Create your account",
      description: "Register with your US mobile number — no password to remember.",
      details:
        "Go to Sign Up, enter your name, organization, and mobile number. We send a one-time verification code by SMS (Twilio Verify). Sign in the same way at /auth/login anytime.",
      color: "from-trust-600 to-trust-800",
    },
    {
      number: 2,
      icon: Plus,
      title: "Create an event",
      description: "Launch a donation drive, tickets, RSVP, volunteers, or sponsorship.",
      details:
        "From your dashboard, choose an event type, set goals and dates, add a description and image, and connect payout details. Events are the hub for donations, ticketing, and optional P2P or auction modules.",
      color: "from-trust-500 to-trust-700",
    },
    {
      number: 3,
      icon: Users,
      title: "Enable peer-to-peer (optional)",
      description: "Let supporters run personal fundraising pages for your event.",
      details:
        "Fundraisers sign in and use Become a Fundraiser to create a page at /p/[slug] with a live thermometer, story, and goal. Add teams and leaderboards; matching gifts can amplify donations automatically.",
      color: "from-action-500 to-action-600",
    },
    {
      number: 4,
      icon: Gavel,
      title: "Run mobile auctions (optional)",
      description: "Silent or live auctions with real-time bidding on phones.",
      details:
        "Bidders register and vault a PayPal payment method once, then bid on lots from the auction catalog. Bids update in real time; anti-snipe extends lots in the final minute. Winners are captured when lots close.",
      color: "from-action-500 to-action-700",
    },
    {
      number: 5,
      icon: Share2,
      title: "Publish and share",
      description: "Go live and spread your event, P2P, and auction links.",
      details:
        "Publish when ready. Share the event page, individual fundraiser links (/p/slug), and auction URLs by text, email, or social. Donor wall and leaderboards update live during the campaign.",
      color: "from-trust-600 to-trust-800",
    },
    {
      number: 6,
      icon: CreditCard,
      title: "Accept payments with PayPal",
      description: "Donations and tickets checkout through PayPal only.",
      details:
        "Supporters pay with cards, PayPal balance, Venmo, or Pay Later where available. All new checkout uses PayPal (legacy card processors are not supported). Receipts and attribution to P2P pages are handled automatically.",
      color: "from-trust-700 to-trust-900",
    },
    {
      number: 7,
      icon: Bell,
      title: "Stay in the loop",
      description: "Push, SMS, and in-app alerts — especially for auction bidders.",
      details:
        "Auction bidders can enable Web Push after placing a bid to get outbid alerts quickly. SMS uses our messaging service (US deliverability depends on carrier registration). There is no separate marketing email provider on the platform.",
      color: "from-action-500 to-action-600",
    },
    {
      number: 8,
      icon: BarChart3,
      title: "Track results and payouts",
      description: "Dashboards, exports, and organizer payout requests.",
      details:
        "Monitor donations, tickets, auction GMV, and fundraiser progress in real time. Request cash out from Organizer Payouts when your event ends. Platform operators use a separate Admin Console at /admin/login.",
      color: "from-action-500 to-trust-700",
    },
  ];

  const capabilities = [
    "Phone-verified organizer accounts (Twilio Verify)",
    "PayPal-only payments for donations, tickets, and auction capture",
    "Personal fundraising pages, teams, leaderboards, and matching gifts",
    "Mobile-first auctions with vault-at-register and capture-on-win",
    "Realtime bid and leaderboard updates plus optional Web Push outbid alerts",
    "Donor wall and live thermometers on public pages",
    "Separate platform admin console for internal operations (/admin/login)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-trust-50">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-trust-600 to-action-500 flex items-center justify-center shadow-lg">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-trust-950 mb-4">
            Getting Started
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            EventraiseHub helps schools, nonprofits, and community groups run donations, ticketing,
            peer-to-peer campaigns, and mobile auctions from one place — with secure PayPal checkout
            and phone-based sign-in for organizers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="bg-gradient-to-r from-action-500 to-action-600 hover:from-action-400 hover:to-action-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign up with your phone
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faqs">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-trust-200 text-trust-700 hover:bg-trust-50"
              >
                View FAQs
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {steps.map((step) => (
            <Card
              key={step.number}
              className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-5 rounded-full -mr-16 -mt-16`}
              />
              <CardHeader className="relative">
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg mr-4`}
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-md`}
                  >
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-trust-950">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-slate-700 font-medium mb-3">{step.description}</p>
                <p className="text-slate-600 leading-relaxed">{step.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-trust-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-trust-950 flex items-center">
                <CheckCircle className="h-6 w-6 text-trust-600 mr-3" />
                What you can run today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {capabilities.map((item) => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-trust-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-trust-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-trust-950">Who signs in where?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-700">
              <p>
                <strong className="text-trust-900">Organizers & fundraisers</strong> —{" "}
                <Link href="/auth/login" className="text-trust-800 underline font-medium">
                  /auth/login
                </Link>{" "}
                or{" "}
                <Link href="/auth/register" className="text-trust-800 underline font-medium">
                  /auth/register
                </Link>{" "}
                with a verified US mobile number.
              </p>
              <p>
                <strong className="text-trust-900">Platform operators</strong> —{" "}
                <Link href="/admin/login" className="text-trust-800 underline font-medium">
                  /admin/login
                </Link>{" "}
                with a registered admin email, phone, and password (separate from organizer login).
              </p>
              <p>
                <strong className="text-trust-900">Donors & bidders</strong> — usually no account;
                checkout or auction registration uses PayPal and optional push/SMS for bid alerts.
              </p>
              <div className="space-y-3 pt-2">
                <Link href="/faqs">
                  <Button variant="outline" className="w-full border-2 border-trust-200 text-trust-700 hover:bg-trust-50">
                    Browse FAQs
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="w-full bg-trust-800 hover:bg-trust-900">Start your first event</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-trust-50 to-action-50">
            <CardContent className="p-8">
              <h3 className="text-3xl font-bold text-trust-950 mb-4">Ready to launch?</h3>
              <p className="text-slate-600 mb-6 text-lg">
                Create your organizer account in minutes, publish your event, and invite fundraisers
                or bidders when you are ready.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
                  Get started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

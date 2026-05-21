import Link from "next/link";
import { Navigation } from "@/components/layout/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "FAQs — EventraiseHub",
  description:
    "Answers about phone sign-in, PayPal payments, peer-to-peer fundraising, mobile auctions, and the EventraiseHub platform.",
};

const faqSections = [
  {
    title: "Platform basics",
    items: [
      {
        question: "What is EventraiseHub?",
        answer:
          "EventraiseHub is an all-in-one event and fundraising platform for schools, nonprofits, and community groups. Run donation drives, ticketed events, RSVPs, volunteer signups, peer-to-peer personal pages, and mobile auctions — with PayPal checkout, realtime progress, and organizer dashboards.",
      },
      {
        question: "How do I create an organizer account?",
        answer:
          "Use Sign Up at /auth/register. Enter your name, organization, and US mobile number. We send a one-time SMS verification code (Twilio Verify). There is no email-and-password organizer login — use the same phone flow at /auth/login to return.",
      },
      {
        question: "Is EventraiseHub free?",
        answer:
          "There is no subscription fee to create events. A platform fee of 8.99% applies to eligible donations to cover payment processing, hosting, and maintenance. Ticket and auction pricing follow the fee rules shown at checkout.",
      },
      {
        question: "Who should use the Admin Console?",
        answer:
          "The Admin Console at /admin/login is for EventraiseHub platform operators only (reports, payouts, admin roster). It uses a separate email, phone, and password — not organizer phone login. Event organizers use /auth/login.",
      },
    ],
  },
  {
    title: "Events, donations & payouts",
    items: [
      {
        question: "How do I create and publish an event?",
        answer:
          "After signing in, open your dashboard and create an event. Choose the type (donation, ticketed, RSVP, volunteer, sponsorship, etc.), add details and goals, then publish. You will get shareable links for the event and any linked P2P or auction experiences.",
      },
      {
        question: "How are donations and ticket payments processed?",
        answer:
          "All new checkout uses PayPal. Supporters can pay with major cards, PayPal balance, Venmo, or Pay Later where PayPal offers it. Legacy Braintree card flows are no longer supported on the platform.",
      },
      {
        question: "How does cash out work for organizers?",
        answer:
          "When your event ends, request a cash out from Organizer Payouts. Transfers are processed manually by our team via your selected method (PayPal, Venmo, or ACH). You will be notified when the transfer is initiated.",
      },
      {
        question: "Do you support international payments?",
        answer:
          "Checkout is oriented around USD through PayPal. PayPal determines which funding instruments are available in each country. Contact us if you need guidance for a specific cross-border scenario.",
      },
    ],
  },
  {
    title: "Peer-to-peer fundraising",
    items: [
      {
        question: "What is a personal fundraising page?",
        answer:
          "Supporters who sign in can launch a personal page at /p/[slug] tied to your event — with a story, goal, and live thermometer. Donations made through that link credit their campaign total automatically.",
      },
      {
        question: "Can we use teams and leaderboards?",
        answer:
          "Yes. Enable teams for your event so fundraisers can join a team, compete on leaderboards, and see rank updates. Matching gift rules can amplify donations up to configured caps.",
      },
      {
        question: "How do matching gifts work?",
        answer:
          "Organizers can configure matching gifts for an event. When a qualifying donation is made, the platform applies the multiplier until the matching pool is exhausted, with totals reflected on the fundraiser and event views.",
      },
    ],
  },
  {
    title: "Auctions & mobile bidding",
    items: [
      {
        question: "How do mobile auctions work?",
        answer:
          "Create an auction under your event. Bidders register on their phone and vault a PayPal payment method once. They browse lots, place bids with preset increments, and see high bids update in realtime. Lots can anti-snipe (extend closing time) when bids arrive in the final minute.",
      },
      {
        question: "When is the winner charged?",
        answer:
          "Payment methods are vaulted at registration; the winning amount is captured after the lot closes (capture-on-win). Failed captures are flagged for the organizer console so staff can follow up.",
      },
      {
        question: "How do outbid notifications work?",
        answer:
          "After placing a bid, bidders can allow Web Push for instant outbid alerts. SMS may also be sent where messaging is configured (US bulk SMS requires carrier-approved 10DLC registration). In-app notifications are stored in the bidder account when signed in.",
      },
    ],
  },
  {
    title: "Security, mobile & support",
    items: [
      {
        question: "Is my data secure?",
        answer:
          "We use industry-standard encryption, secure PayPal processing for payments, and row-level security in our database. Organizer sessions use verified phone auth; admin access is limited to approved platform admins.",
      },
      {
        question: "Can I manage everything on my phone?",
        answer:
          "Yes. Event pages, donation flows, P2P thermometers, leaderboards, and auction bid sheets are built mobile-first so organizers and supporters can participate from any device.",
      },
      {
        question: "How do I get help?",
        answer:
          "Start with this FAQ and the Getting Started guide. For account or payout issues, use the Contact page. Platform admins with console access should sign in at /admin/login for operational tools.",
      },
    ],
  },
];

export default function FAQsPage() {
  let index = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-trust-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-action-500 to-action-600 flex items-center justify-center shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-trust-950 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            How EventraiseHub works today — phone sign-in, PayPal payments, peer-to-peer pages, and
            mobile auctions.
          </p>
        </div>

        <div className="space-y-10">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-trust-900 mb-4 border-b border-trust-100 pb-2">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((faq) => {
                  index += 1;
                  const n = index;
                  return (
                    <Card
                      key={faq.question}
                      className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-trust-950 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-trust-100 text-trust-700 text-sm font-bold flex items-center justify-center mr-3">
                            {n}
                          </span>
                          {faq.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="shadow-xl border-0 bg-gradient-to-r from-trust-50 to-trust-100">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-trust-950 mb-4">Still have questions?</h3>
              <p className="text-slate-600 mb-6">
                Walk through the step-by-step guide or create your organizer account to try the
                platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/getting-started">
                  <Button className="bg-gradient-to-r from-action-500 to-action-600 hover:from-action-400 hover:to-action-600 shadow-lg">
                    Getting Started Guide
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="border-2 border-trust-200 text-trust-700 hover:bg-trust-50">
                    Sign up with phone
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

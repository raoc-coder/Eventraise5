import Image from 'next/image'
import { Features } from '@/components/blocks/features-2'
import { Heart, Shield, TrendingUp } from 'lucide-react'

export default function Features2DemoPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 h-72 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
          priority
        />
      </div>

      <Features
        heading="Everything you need to run successful events"
        subheading="Donations, ticketing, volunteers, and payouts in one platform built for schools and nonprofits."
        items={[
          {
            title: 'Fundraise with confidence',
            icon: Heart,
            description:
              'Accept donations and ticket sales with built-in PayPal — no setup fees for organizers.',
          },
          {
            title: 'Secure by design',
            icon: Shield,
            description:
              'Role-based access, audit-friendly flows, and transparent payout tracking for your team.',
          },
          {
            title: 'Real-time insights',
            icon: TrendingUp,
            description:
              'Live leaderboards, registration analytics, and celebration moments when goals are hit.',
          },
        ]}
      />
    </div>
  )
}

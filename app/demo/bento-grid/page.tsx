'use client'

import Image from 'next/image'
import {
  BentoGrid,
  type BentoItem,
} from '@/components/ui/bento-grid'
import {
  CheckCircle,
  Heart,
  Shield,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

const eventraiseBentoItems: BentoItem[] = [
  {
    title: 'Live fundraising',
    meta: 'Real-time',
    description:
      'Track donations, ticket sales, and campaign progress with live leaderboards and goal meters.',
    icon: <TrendingUp className="h-4 w-4 text-primary" aria-hidden />,
    status: 'Live',
    tags: ['Donations', 'Goals', 'Analytics'],
    colSpan: 2,
    hasPersistentHover: true,
    cta: 'View dashboard →',
  },
  {
    title: 'Volunteer signups',
    meta: 'Shift-based',
    description:
      'Collect volunteer availability, assign roles, and send reminders from one workflow.',
    icon: <Users className="h-4 w-4 text-trust-600" aria-hidden />,
    status: 'Active',
    tags: ['Volunteers', 'Scheduling'],
  },
  {
    title: 'PayPal payouts',
    meta: 'Built-in',
    description:
      'Connect PayPal once and route payouts to organizers with transparent fee breakdowns.',
    icon: <Wallet className="h-4 w-4 text-action-600" aria-hidden />,
    tags: ['Payments', 'Payouts'],
    colSpan: 2,
    cta: 'Set up payouts →',
  },
  {
    title: 'Trust & compliance',
    meta: 'School-ready',
    description:
      'Privacy-first defaults, role-based access, and terms built for nonprofits and PTAs.',
    icon: <Shield className="h-4 w-4 text-trust-700" aria-hidden />,
    status: 'Verified',
    tags: ['Security', 'Privacy'],
  },
  {
    title: 'Event check-in',
    meta: 'QR ready',
    description: 'RSVP and ticketed events with check-in lists and attendance exports.',
    icon: <CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden />,
    tags: ['Tickets', 'RSVP'],
  },
  {
    title: 'Community moments',
    meta: 'Celebrate',
    description:
      'Share milestones, thank donors, and highlight top supporters on your event page.',
    icon: <Heart className="h-4 w-4 text-red-500" aria-hidden />,
    status: 'New',
    tags: ['Engagement', 'Social'],
  },
]

function BentoGridDemo() {
  return <BentoGrid items={eventraiseBentoItems} />
}

export default function BentoGridDemoPage() {
  return (
    <div className="relative min-h-screen bg-background py-12">
      <div className="absolute inset-0 -z-10 h-80">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
          priority
        />
      </div>
      <div className="mx-auto mb-8 max-w-7xl px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground">Platform highlights</h1>
        <p className="mt-2 text-muted-foreground">
          Bento grid for feature marketing on homepage or getting started.
        </p>
      </div>
      <BentoGridDemo />
    </div>
  )
}

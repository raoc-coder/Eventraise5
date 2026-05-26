'use client'

import { Hero } from '@/components/blocks/hero'

export function HeroDemo() {
  return (
    <Hero
      title="Raise more. Stress less."
      subtitle="The all-in-one platform for fundraisers, schools, and nonprofits — donations, ticketing, volunteers, and PayPal payouts in one place."
      actions={[
        {
          label: 'Browse Events',
          href: '/events',
          variant: 'outline',
        },
        {
          label: 'Create Event',
          href: '/auth/register',
          variant: 'default',
        },
      ]}
      titleClassName="text-5xl font-extrabold md:text-6xl"
      subtitleClassName="max-w-[600px] text-lg md:text-xl"
      actionsClassName="mt-8"
    />
  )
}

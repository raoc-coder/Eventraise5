import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — EventraiseHub',
  description: 'Simple, transparent pricing for event management. Free tier available. No hidden fees. Built for organizers of all sizes.',
  openGraph: {
    title: 'Pricing — EventraiseHub',
    description: 'Simple, transparent pricing for event management. Free tier available. No hidden fees. Built for organizers of all sizes.',
    url: 'https://eventraisehub.com/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — EventraiseHub',
    description: 'Simple, transparent pricing for event management. Free tier available. No hidden fees. Built for organizers of all sizes.',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

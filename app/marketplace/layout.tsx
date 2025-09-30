import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace — EventraiseHub',
  description: 'Browse and discover events and opportunities. Find donation drives, ticketed events, volunteer positions, and sponsorship opportunities.',
  openGraph: {
    title: 'Marketplace — EventraiseHub',
    description: 'Browse and discover events and opportunities. Find donation drives, ticketed events, volunteer positions, and sponsorship opportunities.',
    url: 'https://eventraisehub.com/marketplace',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketplace — EventraiseHub',
    description: 'Browse and discover events and opportunities. Find donation drives, ticketed events, volunteer positions, and sponsorship opportunities.',
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

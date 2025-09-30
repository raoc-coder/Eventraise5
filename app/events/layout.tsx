import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events — EventraiseHub',
  description: 'Discover and join events: donation drives, ticketed experiences, RSVPs, volunteer opportunities, and sponsorships.',
  openGraph: {
    title: 'Events — EventraiseHub',
    description: 'Discover and join events: donation drives, ticketed experiences, RSVPs, volunteer opportunities, and sponsorships.',
    url: 'https://eventraisehub.com/events',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events — EventraiseHub',
    description: 'Discover and join events: donation drives, ticketed experiences, RSVPs, volunteer opportunities, and sponsorships.',
  },
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

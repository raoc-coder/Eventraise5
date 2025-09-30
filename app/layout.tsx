import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AnalyticsProvider } from './analytics-provider'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventraiseHub — All-in-One Event Management Platform',
  description: 'Create and manage donation drives, ticketed events, RSVPs, volunteer signups, and sponsorships with built-in payments, registrations, and analytics.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  openGraph: {
    title: 'EventraiseHub — All-in-One Event Management Platform',
    description: 'Plan, promote, and power events of all types with donations, ticketing, RSVPs, volunteer management, and payouts.',
    url: 'https://eventraisehub.com',
    siteName: 'EventraiseHub',
    images: [
      { url: 'https://eventraisehub.com/api/og?title=EventraiseHub&subtitle=All-in-One Event Management Platform', width: 1200, height: 630, alt: 'EventraiseHub' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventraiseHub — All-in-One Event Management Platform',
    description: 'Donations, ticketing, RSVPs, volunteer management, sponsorships — one platform.',
    images: ['https://eventraisehub.com/api/og?title=EventraiseHub&subtitle=All-in-One Event Management Platform'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}>
        <AnalyticsProvider>
          <Providers>
            {children}
            <Footer />
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  )
}

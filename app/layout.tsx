import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AnalyticsProvider } from './analytics-provider'
import Footer from '@/components/layout/Footer'
import { MetaPixel } from '@/components/analytics/MetaPixel'

const inter = Inter({ subsets: ['latin'] })

// Prefer a custom OG image, then brand logo, then keep existing dynamic OG as secondary
const BRAND_OG = process.env.NEXT_PUBLIC_BRAND_OG_URL || process.env.NEXT_PUBLIC_BRAND_LOGO_URL || '/brand/logo.png'
const DEFAULT_OG = 'https://eventraisehub.com/api/og?title=EventraiseHub&subtitle=Free Event Management Platform'

export const metadata: Metadata = {
  title: 'EventraiseHub — Free Event Management for Volunteers, Fundraisers, Schools & Organizations',
  description: 'Free event management platform for volunteers, fundraisers, schools, parents, organizations, and trade shows. Create donation drives, ticketed events, RSVPs, volunteer signups with PayPal payments, registrations, and analytics. No setup fees.',
  keywords: [
    'event management',
    'fundraising platform',
    'volunteer management',
    'donation platform',
    'ticketed events',
    'RSVP management',
    'school events',
    'parent organization',
    'trade show management',
    'nonprofit fundraising',
    'community events',
    'charity events',
    'event planning',
    'volunteer opportunities',
    'free event platform',
    'PayPal integration',
    'event registration',
    'volunteer signup',
    'donation tracking',
    'event analytics'
  ],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  openGraph: {
    title: 'EventraiseHub — Free Event Management for Volunteers, Fundraisers & Organizations',
    description: 'All-in-one platform for volunteers, fundraisers, schools, parents, organizations, and trade shows. Create donation drives, ticketed events, RSVPs, volunteer signups with built-in PayPal payments and analytics.',
    url: 'https://eventraisehub.com',
    siteName: 'EventraiseHub',
    images: [
      { url: BRAND_OG, width: 1200, height: 630, alt: 'EventraiseHub' },
      { url: DEFAULT_OG, width: 1200, height: 630, alt: 'EventraiseHub - Free Event Management Platform' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EventraiseHub — Free Event Management for Volunteers & Fundraisers',
    description: 'Free platform for volunteers, fundraisers, schools, organizations. Donations, ticketing, RSVPs, volunteer management — one platform.',
    images: [BRAND_OG || DEFAULT_OG],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://eventraisehub.com',
  },
  icons: {
    icon: [
      { url: '/brand/logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand/logo.png', type: 'image/png', sizes: '48x48' },
      { url: '/brand/logo.png', type: 'image/png', sizes: '64x64' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/brand/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  
  return (
    <html lang="en" data-meta-pixel-id={metaPixelId || undefined}>
      <body className={`${inter.className} bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}>
        <MetaPixel />
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

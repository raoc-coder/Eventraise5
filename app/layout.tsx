import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AnalyticsProvider } from './analytics-provider'
import Footer from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventRaise - Fundraising Platform',
  description: 'Create and manage fundraising events, campaigns, and volunteer opportunities',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
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

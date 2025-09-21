import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AnalyticsProvider } from './analytics-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EventRaise - Fundraising Platform',
  description: 'Create and manage fundraising events, campaigns, and volunteer opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsProvider>
          <Providers>
            {children}
          </Providers>
        </AnalyticsProvider>
      </body>
    </html>
  )
}

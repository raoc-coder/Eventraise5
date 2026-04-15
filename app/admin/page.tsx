import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const sections = [
  {
    title: 'Reports',
    description: 'Monitor pSEO cohorts, indexing signals, and traffic diagnostics.',
    href: '/admin/reports',
    cta: 'Open reports',
  },
  {
    title: 'Event Payouts',
    description: 'Review and update event-level payout processing lifecycle.',
    href: '/admin/payouts/events',
    cta: 'Manage event payouts',
  },
  {
    title: 'Donation Payouts',
    description: 'Inspect donation-level settlement metrics, filters, and exports.',
    href: '/admin/payouts',
    cta: 'Manage donation payouts',
  },
]

export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
          <p className="mt-1 text-gray-600">Owner-only controls and operational reporting.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {sections.map((item) => (
            <Card key={item.href} className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">{item.title}</CardTitle>
                <CardDescription className="text-gray-600">{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={item.href}
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {item.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

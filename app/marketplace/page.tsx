import Link from 'next/link'
import { Navigation } from '@/components/layout/navigation'

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Marketplace</h1>
          <p className="text-gray-600">Discover verified events by cause, location, and urgency</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-32 w-full rounded-md bg-gray-100 mb-3" />
              <h3 className="text-gray-900 font-semibold">Verified Campaign #{i}</h3>
              <p className="text-sm text-gray-600">Impact-focused story and transparent allocation</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-blue-600 text-sm">Education</span>
                <Link href="#" className="text-sm text-blue-600 hover:underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



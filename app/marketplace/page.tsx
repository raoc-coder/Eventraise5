import dynamic from 'next/dynamic'

import Link from 'next/link'
const Navigation = dynamic(() => import('@/components/layout/navigation').then(m => m.Navigation), { ssr: false })

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fundraising Hub</h1>
          <p className="text-gray-300">Discover verified campaigns by cause, location, and urgency</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg border border-gray-800 bg-black/40 p-4">
              <div className="h-32 w-full rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/10 mb-3" />
              <h3 className="text-white font-semibold">Verified Campaign #{i}</h3>
              <p className="text-sm text-gray-400">Impact-focused story and transparent allocation</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-cyan-400 text-sm">Education</span>
                <Link href="#" className="text-sm text-orange-400 hover:underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



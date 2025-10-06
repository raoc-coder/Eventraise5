import { Navigation } from '@/components/layout/navigation'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Top Donors & Milestones</h1>
          <p className="text-gray-600">Celebrating generosity and progress</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <ol className="list-decimal pl-6 space-y-2 text-gray-900">
            <li>Alex P. — $1,000</li>
            <li>Jordan K. — $750</li>
          </ol>
          <div className="mt-6">
            <h2 className="text-gray-900 font-semibold mb-2">Milestones</h2>
            <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
              <li>Reached $5k — Achieved</li>
              <li>100 donors — In progress</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}



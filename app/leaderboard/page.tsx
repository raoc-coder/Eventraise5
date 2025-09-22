'use client'

export default function LeaderboardPage() {
  async function getData() {
    const res = await fetch('/api/leaderboard', { cache: 'no-store' })
    if (!res.ok) return { topDonors: [], milestones: [] }
    return res.json()
  }
  // Simple client fetch for now
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [data, setData] = (require('react') as typeof import('react')).useState<{topDonors:any[];milestones:any[]}>({ topDonors: [], milestones: [] })
  // eslint-disable-next-line react-hooks/rules-of-hooks
  ;(require('react') as typeof import('react')).useEffect(() => { getData().then(setData) }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Top Donors & Milestones</h1>
          <p className="text-gray-300">Celebrating generosity and progress</p>
        </div>

        <div className="rounded-lg border border-gray-800 bg-black/40 p-4">
          <ol className="list-decimal pl-6 space-y-2 text-white">
            {data.topDonors.map((d: any) => (
              <li key={d.rank}>
                {d.name} — ${d.amount}
              </li>
            ))}
            {data.topDonors.length === 0 && <li>No donors yet.</li>}
          </ol>
          <div className="mt-6">
            <h2 className="text-white font-semibold mb-2">Milestones</h2>
            <ul className="list-disc pl-6 text-gray-300 text-sm space-y-1">
              {data.milestones.map((m: any) => (
                <li key={m.id}>{m.label} — {m.achieved ? 'Achieved' : 'In progress'}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}



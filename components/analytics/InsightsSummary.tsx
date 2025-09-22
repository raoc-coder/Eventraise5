'use client'

import { useEffect, useState } from 'react'

type Insights = {
  funnel: { visits: number | null; starts: number; completes: number; conversion: number } | null
  topDonors: { name: string; total: number; count: number }[]
  dropOffs: { step: string; count: number } | null
}

export function InsightsSummary() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/insights?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load insights')
      const json = (await res.json()) as Insights
      setData(json)
    } catch (e: any) {
      setError(e?.message || 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        await fetchInsights()
      } catch (e: any) {
        setError(e?.message || 'Failed to load insights')
      }
    }
    load()
  }, [])

  if (loading) return <p className="text-sm text-gray-500">Loading insights...</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!data) return null

  const conv = data.funnel?.conversion ? Math.round(data.funnel.conversion * 100) : 0
  const starts = data.funnel?.starts ?? 0
  const completes = data.funnel?.completes ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs">
        <input type="date" className="bg-transparent border border-gray-300 rounded px-2 py-1" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-gray-500">to</span>
        <input type="date" className="bg-transparent border border-gray-300 rounded px-2 py-1" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={fetchInsights} className="px-2 py-1 rounded bg-gray-900 text-white">Apply</button>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Starts</div>
          <div className="text-gray-900 font-semibold">{starts}</div>
        </div>
        <div>
          <div className="text-gray-600">Completes</div>
          <div className="text-gray-900 font-semibold">{completes}</div>
        </div>
        <div>
          <div className="text-gray-600">Conversion</div>
          <div className="text-gray-900 font-semibold">{conv}%</div>
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-1">Top Donors</div>
        <ul className="text-sm text-gray-900 space-y-1">
          {data.topDonors.slice(0, 3).map((d) => (
            <li key={d.name} className="flex justify-between">
              <span className="truncate mr-2">{d.name}</span>
              <span>${d.total.toFixed(2)}</span>
            </li>
          ))}
          {data.topDonors.length === 0 && <li className="text-gray-500">No donors yet.</li>}
        </ul>
      </div>
    </div>
  )
}



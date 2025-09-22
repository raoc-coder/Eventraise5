'use client'

import { useEffect, useState } from 'react'

type Donor = {
  id: string
  name: string
  amount: number
  ts: string
}

export function DonorWall() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState<number>(20)
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const fetchDonors = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (limit) params.set('limit', String(limit))
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const res = await fetch(`/api/donor-wall?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load donor wall')
      const data = await res.json()
      setDonors(data.donors || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load donor wall')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        await fetchDonors()
      } catch (e: any) {
        setError(e?.message || 'Failed to load donor wall')
      }
    }
    run()
  }, [])

  if (loading) return <p className="text-gray-300 text-sm">Loading donor wall...</p>
  if (error) return <p className="text-red-400 text-sm">{error}</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <input type="date" className="bg-transparent border border-gray-700 rounded px-2 py-1 text-gray-200" value={from} onChange={(e) => setFrom(e.target.value)} />
        <span className="text-gray-500">to</span>
        <input type="date" className="bg-transparent border border-gray-700 rounded px-2 py-1 text-gray-200" value={to} onChange={(e) => setTo(e.target.value)} />
        <select className="bg-transparent border border-gray-700 rounded px-2 py-1 text-gray-200" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
          {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={fetchDonors} className="px-2 py-1 rounded bg-cyan-600 text-white">Apply</button>
      </div>
      <div className="space-y-2">
      {donors.map((d) => (
        <div key={d.id} className="flex items-center justify-between text-sm text-gray-200 py-1 border-b border-gray-800/40">
          <span className="truncate mr-2">{d.name}</span>
          <span className="text-cyan-400">${d.amount.toFixed(2)}</span>
        </div>
      ))}
      {donors.length === 0 && <p className="text-gray-400 text-sm">No recent donors yet.</p>}
      </div>
    </div>
  )
}



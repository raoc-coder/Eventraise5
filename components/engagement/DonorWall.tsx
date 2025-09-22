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

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch('/api/donor-wall', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load donor wall')
        const data = await res.json()
        setDonors(data.donors || [])
      } catch (e: any) {
        setError(e?.message || 'Failed to load donor wall')
      } finally {
        setLoading(false)
      }
    }
    fetchDonors()
  }, [])

  if (loading) return <p className="text-gray-300 text-sm">Loading donor wall...</p>
  if (error) return <p className="text-red-400 text-sm">{error}</p>

  return (
    <div className="space-y-2">
      {donors.map((d) => (
        <div key={d.id} className="flex items-center justify-between text-sm text-gray-200 py-1 border-b border-gray-800/40">
          <span className="truncate mr-2">{d.name}</span>
          <span className="text-cyan-400">${d.amount.toFixed(2)}</span>
        </div>
      ))}
      {donors.length === 0 && <p className="text-gray-400 text-sm">No recent donors yet.</p>}
    </div>
  )
}



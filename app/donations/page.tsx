'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type DonationRequest = {
  id: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
}

export default function DonationsListPage() {
  const [items, setItems] = useState<DonationRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    if (!url || !anon) {
      setLoading(false)
      return
    }
    const client = createClient(url, anon, {
      global: { headers: { apikey: anon, Authorization: `Bearer ${anon}` } },
    })
    client
      .from('donation_requests')
      .select('id, amount_cents, currency, status, created_at')
      .order('created_at', { ascending: false })
      .limit(25)
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="card-soft">
          <CardHeader>
            <CardTitle className="text-white">My Donations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-300">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-gray-300">No donations yet.</p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {items.map((d) => (
                  <li key={d.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">${(d.amount_cents / 100).toFixed(2)} {d.currency.toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-sm text-gray-300">{d.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



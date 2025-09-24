'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/layout/navigation'
import { createClient } from '@supabase/supabase-js'

export default function MyEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        // include user id header for ownership filtering
        let headers: Record<string, string> = {}
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          if (url && key) {
            const client = createClient(url, key)
            const { data } = await client.auth.getSession()
            const uid = data?.session?.user?.id
            if (uid) headers['x-user-id'] = uid
          }
        } catch {}
        const res = await fetch('/api/events?mine=1', { headers })
        const json = await res.json()
        setEvents(json.events || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="display text-white mb-6">My Events</h1>
        {loading ? (
          <p className="text-gray-300">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-gray-300">You haven’t created any events yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <Card key={ev.id} className="card-soft">
                <CardHeader>
                  <CardTitle className="text-white">{ev.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-3">{ev.description || 'No description'}</p>
                  <div className="flex justify-between">
                    <span className="text-cyan-400 text-sm">{ev.event_type}</span>
                    <Link href={`/events/${ev.id}`} className="text-sm text-orange-400 hover:underline">Manage</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



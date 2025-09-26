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
            const token = data?.session?.access_token
            if (uid) headers['x-user-id'] = uid
            if (token) headers['Authorization'] = `Bearer ${token}`
          }
        } catch {}
        const res = await fetch('/api/events?mine=1', { headers, cache: 'no-store' as RequestCache })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          console.error('Failed to fetch my events:', json)
          setEvents([])
        } else {
          setEvents(json.events || [])
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">My Events</h1>
        {loading ? (
          <p className="text-gray-700">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-gray-700">You haven’t created any campaigns yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <Card key={ev.id} className="event-card">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">{ev.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 mb-3">{ev.description || 'No description'}</p>
                  <div className="flex justify-between">
                    <span className="text-blue-700 text-xs px-2 py-1 bg-blue-50 rounded-full font-medium">{ev.event_type || 'direct_donation'}</span>
                    <Link href={`/events/${ev.id}`} className="text-sm text-blue-600 hover:underline">Manage</Link>
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



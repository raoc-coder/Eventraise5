'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
            console.log('User session data:', { uid, hasToken: !!token })
            if (uid) headers['x-user-id'] = uid
            if (token) headers['Authorization'] = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Error getting user session:', error)
        }
        const res = await fetch('/api/events?mine=1', { headers, cache: 'no-store' as RequestCache })
        const json = await res.json().catch(() => ({}))
        console.log('API response:', { status: res.status, json })
        if (!res.ok) {
          console.error('Failed to fetch my events:', json)
          setEvents([])
        } else {
          console.log('Setting events:', json.events?.length || 0)
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
          <p className="text-gray-700">You haven&apos;t created any events yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 no-overflow">
            {events.map((ev) => (
              <Card key={ev.id} className="hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <CardTitle className="text-xl font-semibold text-gray-900 truncate">{ev.title}</CardTitle>
                      {('organization_name' in (ev as any)) && (ev as any).organization_name && (
                        <p className="text-sm text-gray-600 mt-1 truncate">{(ev as any).organization_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold truncate-soft max-w-[120px]">
                        {(ev.event_type) || 'Direct Donation'}
                      </span>
                      {('is_published' in (ev as any)) && (
                        (ev as any).is_published ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Published</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Draft</span>
                        )
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-2 text-gray-700 break-words truncate-soft">
                    {ev.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="truncate">{(ev as any).event_type || 'Direct Donation'}</span>
                      <span className="truncate">{(ev as any).start_date ? new Date((ev as any).start_date).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/events/${ev.id}`} className="flex-1">
                        <Button className="w-full">View Details</Button>
                      </Link>
                      <Link href={`/events/${ev.id}`}>
                        <Button variant="outline" className="whitespace-nowrap">Manage</Button>
                      </Link>
                    </div>
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



'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { useAuth } from '@/app/providers'
import { 
  Calendar, 
  MapPin, 
  Heart,
  Users,
  DollarSign,
  Target,
  Edit,
  Settings,
  Plus,
  Rows,
  LayoutGrid
} from 'lucide-react'

export default function MyEventsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [compact, setCompact] = useState(false)
  const [sortBy, setSortBy] = useState<'upcoming'|'newest'|'most_raised'>('upcoming')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const fetchEvents = useCallback(async () => {
    if (fetchingRef.current) return
    try {
      fetchingRef.current = true
      setLoading(true)
      let headers: Record<string, string> = {}
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        if (url && key) {
          const client = sharedSupabase!
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
      const res = await fetch(`/api/events?mine=1&t=${Date.now()}`, { headers, cache: 'no-store' as RequestCache, next: { revalidate: 0 } })
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
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (user && !authLoading) {
      fetchEvents()
    }
  }, [user, authLoading, fetchEvents])

  useEffect(() => {
    setPage(1)
  }, [user, sortBy])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-700">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const now = new Date().getTime()
  const sorted = [...events].sort((a, b) => {
    const aStart = a.start_date ? new Date(a.start_date).getTime() : 0
    const bStart = b.start_date ? new Date(b.start_date).getTime() : 0
    if (sortBy === 'upcoming') {
      const aDelta = aStart >= now ? aStart - now : Number.MAX_SAFE_INTEGER
      const bDelta = bStart >= now ? bStart - now : Number.MAX_SAFE_INTEGER
      return aDelta - bDelta
    }
    if (sortBy === 'newest') {
      return (bStart || 0) - (aStart || 0)
    }
    const aScore = (a.tickets_sold || 0)
    const bScore = (b.tickets_sold || 0)
    if (bScore !== aScore) return bScore - aScore
    return (bStart || 0) - (aStart || 0)
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const startIdx = (page - 1) * pageSize
  const endIdx = startIdx + pageSize
  const paginated = sorted.slice(startIdx, endIdx)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">My Events</h1>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e)=>setSortBy(e.target.value as any)}
              className="px-3 py-2 h-10 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort events"
            >
              <option value="upcoming">Upcoming</option>
              <option value="newest">Newest</option>
              <option value="most_raised">Most Raised</option>
            </select>
            <Button variant="outline" onClick={()=>setCompact(c=>!c)} aria-label="Toggle view" className="h-10 px-3">
              {compact ? <LayoutGrid className="h-4 w-4" /> : <Rows className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 w-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full" />
                    <div className="h-5 w-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full" />
                  </div>
                </div>
                <div className="h-4 w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-3" />
                <div className="h-4 w-3/4 bg-gradient-to-r from-gray-100 to-gray-200 rounded mb-4" />
                <div className="mb-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2 w-1/3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 w-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg" />
                  <div className="h-10 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ready to make an impact?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start your event and start raising funds for causes you care about. It only takes a few minutes to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/events/create">
                <Button size="mobile" className="px-8">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Event
                </Button>
              </Link>
              <Link href="/getting-started">
                <Button variant="outline" size="mobile" className="px-6">
                  Learn How
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {compact ? (
              <div className="divide-y border rounded-lg overflow-hidden bg-white">
                <div className="grid grid-cols-12 bg-gray-50 text-gray-700 text-sm font-medium">
                  <div className="col-span-5 px-4 py-3">Title</div>
                  <div className="col-span-2 px-4 py-3">Type</div>
                  <div className="col-span-2 px-4 py-3">Date</div>
                  <div className="col-span-2 px-4 py-3 hidden sm:block">Location</div>
                  <div className="col-span-1 px-4 py-3 text-right">Actions</div>
                </div>
                {paginated.map(ev => (
                  <div key={ev.id} className="grid grid-cols-12 items-center text-sm hover:bg-gray-50">
                    <div className="col-span-5 px-4 py-3">
                      <div className="font-semibold text-gray-900 truncate">{ev.title}</div>
                      <div className="text-gray-600 truncate">{ev.description || 'No description'}</div>
                    </div>
                    <div className="col-span-2 px-4 py-3 text-gray-700">{ev.is_ticketed ? 'Ticketed Event' : (ev.event_type || 'Event')}</div>
                    <div className="col-span-2 px-4 py-3 text-gray-700">{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : ''}</div>
                    <div className="col-span-2 px-4 py-3 text-gray-700 hidden sm:block">{ev.location || ''}</div>
                    <div className="col-span-1 px-4 py-3 flex items-center justify-end gap-2">
                      <a href={`/events/${ev.id}`} className={buttonVariants({ variant: 'outline', className: 'h-9 px-3 text-xs' })}>View</a>
                      <a href={`/events/${ev.id}`} className={buttonVariants({ className: 'h-9 px-3 text-xs' })}>Open</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {paginated.map((ev) => (
                  <Card key={ev.id} className="hover:shadow-md transition-all duration-200">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900">{ev.title}</CardTitle>
                          {('organization_name' in (ev as any)) && (ev as any).organization_name && (
                            <p className="text-sm text-gray-600 mt-1">{(ev as any).organization_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            ev.is_ticketed 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {ev.is_ticketed ? 'Ticketed Event' : 'Event'}
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
                      <CardDescription className="mt-2 text-gray-700">
                        {ev.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{ev.event_type || 'Event'}</span>
                          <span>{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : ''}</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="truncate">{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : ''}</span>
                          </div>
                          {(ev.location) && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-green-600" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-4">
                          <a href={`/events/${ev.id}`} className={buttonVariants({ className: 'flex-1' })} style={{ textDecoration: 'none' }}>View Details</a>
                          <a href={`/events/${ev.id}`} className={buttonVariants({ variant: 'outline', className: 'whitespace-nowrap' })} style={{ textDecoration: 'none' }}>
                            <span className="inline-flex items-center"><Settings className="h-4 w-4 mr-1" />Manage</span>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {events.length > pageSize && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                <span className="text-sm text-gray-700">Page {page} of {Math.max(1, Math.ceil(events.length / pageSize))}</span>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(events.length / pageSize)} onClick={() => setPage(p => Math.min(Math.ceil(events.length / pageSize), p + 1))}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}



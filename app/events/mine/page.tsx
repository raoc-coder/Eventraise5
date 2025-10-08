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
  Plus
} from 'lucide-react'

export default function MyEventsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  // No JS navigation fallback; rely on plain anchors for reliability
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)
  const [page, setPage] = useState(1)
  const pageSize = 12

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const getEventTypeLabel = (type: string, isTicketed?: boolean) => {
    if (isTicketed) return 'Ticketed Event'
    const labels: { [key: string]: string } = {
      walkathon: 'Walk-a-thon',
      auction: 'Auction',
      product_sale: 'Product Sale',
      direct_donation: 'Direct Donation',
      raffle: 'Raffle'
    }
    return labels[type] || type
  }

  const formatType = (t?: string) => {
    const map: Record<string,string> = { walkathon: 'Walk-a-thon', auction: 'Auction', product_sale: 'Product Sale', direct_donation: 'Direct Donation', raffle: 'Raffle' }
    return map[t || ''] || (t || 'Event')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const fetchEvents = useCallback(async () => {
    if (fetchingRef.current) return // Prevent multiple simultaneous calls
    
    try {
      fetchingRef.current = true
      setLoading(true)
      // include user id header for ownership filtering
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
      const res = await fetch(`/api/events?mine=1&t=${Date.now()}`, { 
        headers, 
        cache: 'no-store' as RequestCache,
        next: { revalidate: 0 }
      })
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
  }, [user])

  // Listen for event deletion events to refresh the list
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'event-deleted') {
        console.log('Event deleted, refreshing events list')
        fetchEvents()
      }
    }

    window.addEventListener('storage', handleStorageEvent)
    return () => window.removeEventListener('storage', handleStorageEvent)
  }, [fetchEvents])

  // Show loading while checking authentication
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

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize))
  const startIdx = (page - 1) * pageSize
  const endIdx = startIdx + pageSize
  const paginated = events.slice(startIdx, endIdx)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">My Events</h1>
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
                      {/* Goal + Thermometer or Ticket Info */}
                      {ev.is_ticketed ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              ${(ev.ticket_price || 0).toFixed(2)} {ev.ticket_currency?.toUpperCase() || 'USD'}
                            </span>
                            <span className="text-xs text-gray-700">
                              {ev.tickets_sold || 0} sold
                              {ev.ticket_quantity && ` • ${ev.ticket_quantity - (ev.tickets_sold || 0)} left`}
                            </span>
                          </div>
                          {ev.ticket_quantity && (
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-2 bg-purple-600" 
                                style={{ 
                                  width: `${Math.min(100, Math.max(0, ((ev.tickets_sold || 0) / ev.ticket_quantity) * 100))}%` 
                                }} 
                              />
                            </div>
                          )}
                        </div>
                      ) : (() => {
                        const goal = Number((ev as any).goal_amount || 0)
                        const raisedRaw = (ev as any).total_raised ?? (ev as any).amount_raised ?? (ev as any).raised ?? 0
                        const raised = Number(raisedRaw) || 0
                        if (!goal || goal <= 0) return null
                        const pct = Math.min(100, Math.max(0, Math.round((raised / goal) * 100)))
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Goal: ${goal.toLocaleString()}</span>
                              <span className="text-xs text-gray-700">Raised ${raised.toLocaleString()} • {pct}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div className="h-2 bg-blue-600" style={{ width: pct + '%' }} />
                            </div>
                          </div>
                        )
                      })()}

                      {/* Compact meta row */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{ev.event_type || 'Event'}</span>
                        <span>{ev.start_date ? new Date(ev.start_date).toLocaleDateString() : ''}</span>
                      </div>

                      {/* Event Details */}
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

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <a
                          href={`/events/${ev.id}`}
                          className={buttonVariants({ className: 'flex-1' })}
                          style={{ textDecoration: 'none' }}
                        >
                          View Details
                        </a>
                        <a
                          href={`/events/${ev.id}`}
                          className={buttonVariants({ variant: 'outline', className: 'whitespace-nowrap' })}
                          style={{ textDecoration: 'none' }}
                        >
                          <span className="inline-flex items-center"><Settings className="h-4 w-4 mr-1" />Manage</span>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
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



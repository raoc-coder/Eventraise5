'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/app/providers'
import { 
  Calendar, 
  MapPin, 
  Heart,
  Users,
  DollarSign,
  Target,
  Edit,
  Settings
} from 'lucide-react'

export default function MyEventsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const getEventTypeLabel = (type: string) => {
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

  const fetchEvents = async () => {
    try {
      setLoading(true)
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
      const res = await fetch('/api/events?mine=1', { 
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
    }
  }

  useEffect(() => {
    if (user && !authLoading) {
      fetchEvents()
    }
  }, [user, authLoading])


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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((ev) => (
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
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                        {getEventTypeLabel(ev.event_type || '')}
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
                    {/* Goal + Thermometer */}
                    {(() => {
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
                      <span>{formatType(ev.event_type)}</span>
                      <span>{ev.start_date ? formatDate(ev.start_date) : ''}</span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate">{ev.start_date ? formatDate(ev.start_date) : ''}</span>
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
                      <Link href={`/events/${ev.id}`} className="flex-1">
                        <Button className="w-full">View Details</Button>
                      </Link>
                      <Link href={`/events/${ev.id}`}>
                        <Button variant="outline" className="whitespace-nowrap">
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
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



'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/layout/navigation'
import { useCurrency } from '@/app/providers/currency-provider'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  DollarSign, 
  Users,
  Heart,
  MapPin,
  Clock,
  Sparkles,
  Star,
  Zap,
  Gift,
  Target,
  Award,
  Bell,
  Ticket,
  X,
  Rows,
  LayoutGrid
} from 'lucide-react'

interface Event {
  id: string
  title?: string
  description?: string
  event_type?: string
  start_date?: string
  end_date?: string
  location?: string
  is_ticketed?: boolean
  ticket_price?: number
  ticket_currency?: string
  ticket_quantity?: number
  tickets_sold?: number
}

export default function EventsPage() {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  const [compact, setCompact] = useState(false)
  const [sortBy, setSortBy] = useState<'upcoming'|'newest'|'most_raised'>('upcoming')
  const pageSize = 12
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const qs = new URLSearchParams()
        if (filterType && filterType !== 'all') qs.set('type', filterType)
        const response = await fetch(`/api/events${qs.toString() ? `?${qs.toString()}` : ''}`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        } else {
          console.error('Failed to fetch events:', response.statusText)
          setEvents([])
        }
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [filterType])

  useEffect(() => {
    setPage(1)
  }, [filterType, searchTerm, sortBy])

  const filteredEvents = events.filter(event => {
    const title = (event.title || '').toLowerCase()
    const desc = (event.description || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase())
    let matchesFilter = true
    if (filterType === 'ticketed') {
      matchesFilter = event.is_ticketed === true
    } else if (filterType !== 'all') {
      matchesFilter = (event.event_type || '') === filterType
    }
    return matchesSearch && matchesFilter
  })

  const now = new Date().getTime()
  const sorted = [...filteredEvents].sort((a, b) => {
    const aStart = a.start_date ? new Date(a.start_date).getTime() : 0
    const bStart = b.start_date ? new Date(b.start_date).getTime() : 0
    if (sortBy === 'upcoming') {
      // Nearest future first
      const aDelta = aStart >= now ? aStart - now : Number.MAX_SAFE_INTEGER
      const bDelta = bStart >= now ? bStart - now : Number.MAX_SAFE_INTEGER
      return aDelta - bDelta
    }
    if (sortBy === 'newest') {
      return (bStart || 0) - (aStart || 0)
    }
    // most_raised fallback: use tickets_sold or title as proxy if no amounts
    const aScore = (a.tickets_sold || 0)
    const bScore = (b.tickets_sold || 0)
    if (bScore !== aScore) return bScore - aScore
    return (bStart || 0) - (aStart || 0)
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const startIdx = (page - 1) * pageSize
  const endIdx = startIdx + pageSize
  const paginated = sorted.slice(startIdx, endIdx)

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setPage(p => Math.min(totalPages, p + 1))
        }
      })
    }, { rootMargin: '200px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [totalPages, sortBy, filterType, searchTerm])

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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8" aria-live="polite" role="status">
          <div className="mb-6 sm:mb-8">
            <div className="h-8 w-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse mb-3" />
            <div className="h-4 w-96 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Support Impactful Campaigns</h1>
          <p className="text-gray-600 text-base sm:text-lg">Donate, share, and amplify good with EventraiseHUB</p>
        </div>

        {/* Search / Filter / View + Sort */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  aria-label="Search events"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base h-12 min-w-[180px]"
                aria-label="Filter events by type"
              >
                <option value="all">All Types</option>
                <option value="ticketed">Ticketed Events</option>
                <option value="walkathon">Walk-a-thon</option>
                <option value="auction">Auction</option>
                <option value="product_sale">Product Sale</option>
                <option value="direct_donation">Direct Donation</option>
                <option value="raffle">Raffle</option>
              </select>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e)=>setSortBy(e.target.value as any)}
                  className="px-3 py-2 h-12 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sort events"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="newest">Newest</option>
                  <option value="most_raised">Most Raised</option>
                </select>
                <Button variant="outline" className="h-12 px-3" onClick={()=>setCompact(c=>!c)} aria-label="Toggle view">
                  {compact ? <LayoutGrid className="h-4 w-4" /> : <Rows className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact list view or grid view */}
        {compact ? (
          <div className="divide-y border rounded-lg overflow-hidden">
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
                  <div className="text-gray-600 truncate">{ev.description}</div>
                </div>
                <div className="col-span-2 px-4 py-3 text-gray-700">{formatType(ev.event_type)}</div>
                <div className="col-span-2 px-4 py-3 text-gray-700">{ev.start_date ? formatDate(ev.start_date) : ''}</div>
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
            {paginated.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{event.title}</CardTitle>
                      {('organization_name' in (event as any)) && (event as any).organization_name && (
                        <p className="text-sm text-gray-600 mt-1">{(event as any).organization_name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        event.is_ticketed 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getEventTypeLabel(event.event_type || '', event.is_ticketed)}
                      </span>
                      {('is_published' in (event as any)) && (
                        (event as any).is_published ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Published</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Draft</span>
                        )
                      )}
                    </div>
                  </div>
                  <CardDescription className="mt-2 text-gray-700">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Goal + Thermometer or Ticket Info */}
                    {event.is_ticketed ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {formatCurrency(event.ticket_price || 0)}
                          </span>
                          <span className="text-xs text-gray-700">
                            {event.tickets_sold || 0} sold
                            {event.ticket_quantity && ` • ${event.ticket_quantity - (event.tickets_sold || 0)} left`}
                          </span>
                        </div>
                        {event.ticket_quantity && (
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-2 bg-purple-600" 
                              style={{ 
                                width: `${Math.min(100, Math.max(0, ((event.tickets_sold || 0) / event.ticket_quantity) * 100))}%` 
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    ) : (() => {
                      const goal = Number((event as any).goal_amount || 0)
                      const raisedRaw = (event as any).total_raised ?? (event as any).amount_raised ?? (event as any).raised ?? 0
                      const raised = Number(raisedRaw) || 0
                      if (!goal || goal <= 0) return null
                      const pct = Math.min(100, Math.max(0, Math.round((raised / goal) * 100)))
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Goal: {formatCurrency(goal)}</span>
                            <span className="text-xs text-gray-700">Raised {formatCurrency(raised)} • {pct}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 bg-blue-600" style={{ width: pct + '%' }} />
                          </div>
                        </div>
                      )
                    })()}
                    {/* Progress Bar */}
                    {/* Compact meta row */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatType(event.event_type)}</span>
                      <span>{event.start_date ? formatDate(event.start_date) : ''}</span>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="truncate">{event.start_date ? formatDate(event.start_date) : ''}</span>
                      </div>
                      {(event.location) && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-green-600" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <a
                        href={`/events/${event.id}`}
                        className={buttonVariants({ className: 'flex-1' })}
                        style={{ textDecoration: 'none' }}
                      >
                        View Details
                      </a>
                      {event.is_ticketed ? (
                        <a
                          href={`/events/${event.id}#tickets`}
                          className={buttonVariants({ variant: 'secondary', className: 'whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white' })}
                          style={{ textDecoration: 'none' }}
                        >
                          <span className="inline-flex items-center"><Ticket className="h-4 w-4 mr-1" />Buy Tickets</span>
                        </a>
                      ) : (event.event_type === 'direct_donation') && (
                        <a
                          href={`/events/${event.id}#donate`}
                          className={buttonVariants({ className: 'whitespace-nowrap bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-200' })}
                          style={{ textDecoration: 'none' }}
                        >
                          Donate
                        </a>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-gray-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200" 
                        aria-label="Add to favorites"
                        title="Add to favorites"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fallback Pagination Controls */}
        {sorted.length > pageSize && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  )
}

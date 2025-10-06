'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navigation } from '@/components/layout/navigation'
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
  Ticket
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
  // No JS navigation fallback; rely on normal anchor navigation for reliability across browsers
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Fetch events from API
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-full bg-gray-200 rounded mb-4" />
                <div className="h-2 w-full bg-gray-200 rounded mb-2" />
                <div className="h-2 w-3/4 bg-gray-200 rounded" />
              </div>
            ))}
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

        {/* Search and Filter */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-3 border border-gray-400 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base h-12"
            >
              <option value="all">All Types</option>
              <option value="ticketed">Ticketed Events</option>
              <option value="walkathon">Walk-a-thon</option>
              <option value="auction">Auction</option>
              <option value="product_sale">Product Sale</option>
              <option value="direct_donation">Direct Donation</option>
              <option value="raffle">Raffle</option>
            </select>
            <Button variant="outline" className="h-12">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((event) => (
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
                          ${(event.ticket_price || 0).toFixed(2)} {event.ticket_currency?.toUpperCase() || 'USD'}
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
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Goal: ${goal.toLocaleString()}</span>
                          <span className="text-xs text-gray-700">Raised ${raised.toLocaleString()} • {pct}%</span>
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
                    <button
                      className={buttonVariants({ className: 'flex-1' })}
                      onClick={() => {
                        console.log('View Details clicked for event:', event.id)
                        window.location.href = `/events/${event.id}`
                      }}
                    >
                      View Details
                    </button>
                    {event.is_ticketed ? (
                      <button
                        className={buttonVariants({ variant: 'secondary', className: 'whitespace-nowrap bg-purple-600 hover:bg-purple-700 text-white' })}
                        onClick={() => {
                          console.log('Buy Tickets clicked for event:', event.id)
                          window.location.href = `/events/${event.id}#tickets`
                        }}
                      >
                        <span className="inline-flex items-center"><Ticket className="h-4 w-4 mr-1" />Buy Tickets</span>
                      </button>
                    ) : (event.event_type === 'direct_donation') && (
                      <button
                        className={buttonVariants({ className: 'whitespace-nowrap bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl transition-all duration-200' })}
                        onClick={() => {
                          console.log('Donate clicked for event:', event.id)
                          window.location.href = `/events/${event.id}#donate`
                        }}
                      >
                        Donate
                      </button>
                    )}
                    <Button variant="outline" size="sm" className="text-gray-700" aria-label="Favorite event">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  DollarSign, 
  Users,
  Heart,
  MapPin,
  Clock
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  goal_amount: number
  current_amount: number
  max_participants: number
  organization_name: string
  location: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Spring Charity Walkathon',
        description: 'Join us for a 5K walk to raise funds for local children\'s hospital',
        event_type: 'walkathon',
        start_date: '2024-04-15T09:00:00Z',
        end_date: '2024-04-15T12:00:00Z',
        goal_amount: 10000,
        current_amount: 7500,
        max_participants: 200,
        organization_name: 'Children\'s Health Foundation',
        location: 'Central Park, New York'
      },
      {
        id: '2',
        title: 'Silent Auction Gala',
        description: 'Elegant evening with fine dining and exclusive auction items',
        event_type: 'auction',
        start_date: '2024-04-20T18:00:00Z',
        end_date: '2024-04-20T23:00:00Z',
        goal_amount: 25000,
        current_amount: 18500,
        max_participants: 150,
        organization_name: 'Arts & Culture Society',
        location: 'Grand Ballroom, Downtown'
      },
      {
        id: '3',
        title: 'Bake Sale for Education',
        description: 'Delicious homemade treats supporting local schools',
        event_type: 'product_sale',
        start_date: '2024-04-10T10:00:00Z',
        end_date: '2024-04-10T16:00:00Z',
        goal_amount: 5000,
        current_amount: 3200,
        max_participants: 50,
        organization_name: 'Parent Teacher Association',
        location: 'Community Center'
      }
    ]
    
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || event.event_type === filterType
    
    return matchesSearch && matchesFilter
  })

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

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">EventRaise</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fundraising Events</h1>
          <p className="text-gray-600">Discover and support amazing causes</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="walkathon">Walk-a-thon</option>
              <option value="auction">Auction</option>
              <option value="product_sale">Product Sale</option>
              <option value="direct_donation">Direct Donation</option>
              <option value="raffle">Raffle</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{event.organization_name}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {getEventTypeLabel(event.event_type)}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{getProgressPercentage(event.current_amount, event.goal_amount).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(event.current_amount, event.goal_amount)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>${event.current_amount.toLocaleString()}</span>
                      <span>${event.goal_amount.toLocaleString()} goal</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.start_date)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.max_participants} max participants
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button className="w-full">View Details</Button>
                    </Link>
                    <Button variant="outline" size="sm">
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

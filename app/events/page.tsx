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
  Clock,
  Sparkles,
  Star,
  Zap,
  Gift,
  Target,
  Award,
  Bell
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <Heart className="h-16 w-16 text-pink-500 bounce-animation mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gradient font-semibold">Loading amazing events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Fun Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl floating-animation" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="relative">
                <Heart className="h-8 w-8 text-pink-500 bounce-animation" />
                <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="ml-2 text-xl font-bold text-gradient">EventRaise</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">Dashboard</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h1 className="text-3xl font-bold text-gradient">Fundraising Events 🎉</h1>
            <Star className="h-6 w-6 text-yellow-400 ml-2 bounce-animation" />
          </div>
          <p className="text-gray-600">Discover and support amazing causes ✨</p>
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
            <Button variant="outline" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
              <Filter className="h-4 w-4 mr-2" />
              Filters 🔍
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="card-soft hover:card-glow transition-all duration-300 hover:scale-105 decorative-dots">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gradient">{event.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{event.organization_name}</p>
                  </div>
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs rounded-full font-semibold">
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
                      <span className="text-gradient-success font-semibold">Progress 📈</span>
                      <span className="text-gradient-success font-semibold">{getProgressPercentage(event.current_amount, event.goal_amount).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-300 pulse-glow"
                        style={{ width: `${getProgressPercentage(event.current_amount, event.goal_amount)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span className="font-semibold">${event.current_amount.toLocaleString()} 💰</span>
                      <span>${event.goal_amount.toLocaleString()} goal 🎯</span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">{formatDate(event.start_date)} 📅</span>
                    </div>
                    <div className="flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors">
                      <MapPin className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">{event.location} 📍</span>
                    </div>
                    <div className="flex items-center p-2 rounded-lg hover:bg-purple-50 transition-colors">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium">{event.max_participants} max participants 👥</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button className="w-full btn-fun-primary">View Details 🔍</Button>
                    </Link>
                    <Button variant="outline" size="sm" className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 transition-all duration-300">
                      <Heart className="h-4 w-4 text-pink-500" />
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

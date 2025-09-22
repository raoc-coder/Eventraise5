'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/layout/navigation'
import { 
  Heart, 
  Share2, 
  Calendar, 
  MapPin,
  Users,
  Clock,
  Ticket,
  Star,
  CheckCircle,
  Sparkles,
  Gift,
  Award,
  Shield,
  Zap,
  Target,
  Bell,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { DonationConfirmation } from '@/components/payments/donation-confirmation'
import { EventRegistration } from '@/components/events/event-registration'
import { VolunteerShifts } from '@/components/events/volunteer-shifts'

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  location: string
  max_participants: number
  current_participants: number
  ticket_price: number
  organization_name: string
  image_url?: string
  is_featured: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [participantPhone, setParticipantPhone] = useState('')
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [specialRequests, setSpecialRequests] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data.event)
        } else {
          console.error('Failed to fetch event:', response.statusText)
          setEvent(null)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!participantName || !participantEmail) {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Here you would integrate with payment processing
    toast.success(`Registration successful! You'll receive a confirmation email shortly.`)
    setParticipantName('')
    setParticipantEmail('')
    setParticipantPhone('')
    setTicketQuantity(1)
    setSpecialRequests('')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Join ${event?.title} on EventraiseHub`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <Link href="/events">
            <Button className="btn-primary">Browse Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  const spotsRemaining = event.max_participants - event.current_participants
  const isFullyBooked = spotsRemaining <= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                  EventraiseHub
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/events">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Browse Events</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-soft">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white mb-2">{event.title}</CardTitle>
                    <p className="text-gray-300">{event.organization_name}</p>
                    {event.is_featured && (
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-orange-400 mr-1" />
                        <span className="text-sm text-orange-400 font-semibold">Featured Event</span>
                      </div>
                    )}
                  </div>
                  <Button onClick={handleShare} variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-6">{event.description}</p>
                
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Calendar className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Date & Time</p>
                      <p className="text-white font-semibold">{formatDate(event.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <MapPin className="h-5 w-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white font-semibold">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Users className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Participants</p>
                      <p className="text-white font-semibold">{event.current_participants}/{event.max_participants}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/50">
                    <Ticket className="h-5 w-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Ticket Price</p>
                      <p className="text-white font-semibold">${event.ticket_price}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Schedule */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Event Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/30">
                    <Clock className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-white font-semibold">Registration & Check-in</p>
                      <p className="text-gray-400 text-sm">8:30 AM - 9:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/30">
                    <Clock className="h-5 w-5 text-orange-400 mr-3" />
                    <div>
                      <p className="text-white font-semibold">Walkathon Start</p>
                      <p className="text-gray-400 text-sm">9:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-lg bg-gray-800/30">
                    <Clock className="h-5 w-5 text-cyan-400 mr-3" />
                    <div>
                      <p className="text-white font-semibold">Awards & Refreshments</p>
                      <p className="text-gray-400 text-sm">11:30 AM - 12:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="space-y-6">
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Register for Event</CardTitle>
                <CardDescription className="text-gray-300">
                  Join this amazing event and make a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFullyBooked ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Event Fully Booked</h3>
                    <p className="text-gray-400 mb-4">This event has reached maximum capacity.</p>
                    <Button variant="outline" className="text-gray-400 cursor-not-allowed" disabled>
                      Registration Closed
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={participantPhone}
                        onChange={(e) => setParticipantPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-gray-300">Number of Tickets</Label>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          className="text-cyan-400 hover:bg-cyan-500/20"
                        >
                          -
                        </Button>
                        <span className="text-white font-semibold px-4">{ticketQuantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTicketQuantity(Math.min(5, ticketQuantity + 1))}
                          className="text-cyan-400 hover:bg-cyan-500/20"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requests" className="text-gray-300">Special Requests</Label>
                      <textarea
                        id="requests"
                        placeholder="Any special dietary requirements or accessibility needs..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                      />
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300">Tickets ({ticketQuantity})</span>
                        <span className="text-white font-semibold">${(event.ticket_price * ticketQuantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Processing Fee</span>
                        <span className="text-white font-semibold">$2.50</span>
                      </div>
                      <div className="border-t border-gray-600 mt-2 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">Total</span>
                          <span className="text-cyan-400 font-bold text-lg">
                            ${((event.ticket_price * ticketQuantity) + 2.50).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full btn-primary">
                      <Ticket className="h-4 w-4 mr-2" />
                      Register Now
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Event Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Participants</span>
                    <span className="text-cyan-400 font-bold">{event.current_participants}/{event.max_participants}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.current_participants / event.max_participants) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Spots Remaining</span>
                    <span className="text-white font-bold">{spotsRemaining}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

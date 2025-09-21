'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/providers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Plus,
  Heart,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface VolunteerOpportunity {
  id: string
  title: string
  description: string
  required_skills: string[]
  time_commitment: string
  location: string
  max_volunteers: number
  start_time: string
  end_time: string
  current_volunteers: number
  event_title: string
}

interface VolunteerSignup {
  id: string
  opportunity_id: string
  user_name: string
  user_email: string
  status: string
  signed_up_at: string
  notes: string
}

export default function VolunteersPage() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([])
  const [signups, setSignups] = useState<VolunteerSignup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    required_skills: '',
    time_commitment: '',
    location: '',
    max_volunteers: '',
    start_time: '',
    end_time: '',
    event_id: ''
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockOpportunities: VolunteerOpportunity[] = [
      {
        id: '1',
        title: 'Event Setup Crew',
        description: 'Help set up tables, chairs, and decorations for the charity auction',
        required_skills: ['Physical labor', 'Teamwork'],
        time_commitment: '4 hours',
        location: 'Grand Ballroom, Downtown',
        max_volunteers: 10,
        start_time: '2024-04-20T14:00:00Z',
        end_time: '2024-04-20T18:00:00Z',
        current_volunteers: 7,
        event_title: 'Silent Auction Gala'
      },
      {
        id: '2',
        title: 'Registration Desk',
        description: 'Welcome guests and handle event registration',
        required_skills: ['Customer service', 'Organization'],
        time_commitment: '3 hours',
        location: 'Main Entrance',
        max_volunteers: 4,
        start_time: '2024-04-20T17:00:00Z',
        end_time: '2024-04-20T20:00:00Z',
        current_volunteers: 3,
        event_title: 'Silent Auction Gala'
      },
      {
        id: '3',
        title: 'Walkathon Route Marshals',
        description: 'Guide participants along the 5K route and provide encouragement',
        required_skills: ['Enthusiasm', 'Safety awareness'],
        time_commitment: '2 hours',
        location: 'Central Park Route',
        max_volunteers: 15,
        start_time: '2024-04-15T08:00:00Z',
        end_time: '2024-04-15T10:00:00Z',
        current_volunteers: 12,
        event_title: 'Spring Charity Walkathon'
      }
    ]

    const mockSignups: VolunteerSignup[] = [
      {
        id: '1',
        opportunity_id: '1',
        user_name: 'Sarah Johnson',
        user_email: 'sarah@email.com',
        status: 'confirmed',
        signed_up_at: '2024-04-10T10:00:00Z',
        notes: 'Has experience with event setup'
      },
      {
        id: '2',
        opportunity_id: '1',
        user_name: 'Mike Chen',
        user_email: 'mike@email.com',
        status: 'pending',
        signed_up_at: '2024-04-11T14:30:00Z',
        notes: 'Available for early setup'
      }
    ]

    setTimeout(() => {
      setOpportunities(mockOpportunities)
      setSignups(mockSignups)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically make an API call to create the opportunity
    toast.success('Volunteer opportunity created!')
    setShowCreateForm(false)
    setNewOpportunity({
      title: '',
      description: '',
      required_skills: '',
      time_commitment: '',
      location: '',
      max_volunteers: '',
      start_time: '',
      end_time: '',
      event_id: ''
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setNewOpportunity(prev => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
              <Link href="/events">
                <Button variant="ghost">Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
            <p className="text-gray-600">Manage volunteer opportunities and sign-ups</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>

        {/* Create Opportunity Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Volunteer Opportunity</CardTitle>
              <CardDescription>Add a new volunteer position for your event</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOpportunity} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Position Title *</Label>
                    <Input
                      id="title"
                      value={newOpportunity.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_volunteers">Max Volunteers *</Label>
                    <Input
                      id="max_volunteers"
                      type="number"
                      value={newOpportunity.max_volunteers}
                      onChange={(e) => handleInputChange('max_volunteers', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={newOpportunity.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="required_skills">Required Skills</Label>
                    <Input
                      id="required_skills"
                      placeholder="e.g., Customer service, Physical labor"
                      value={newOpportunity.required_skills}
                      onChange={(e) => handleInputChange('required_skills', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time_commitment">Time Commitment</Label>
                    <Input
                      id="time_commitment"
                      placeholder="e.g., 4 hours, Full day"
                      value={newOpportunity.time_commitment}
                      onChange={(e) => handleInputChange('time_commitment', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newOpportunity.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={newOpportunity.start_time}
                      onChange={(e) => handleInputChange('start_time', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time *</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={newOpportunity.end_time}
                      onChange={(e) => handleInputChange('end_time', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Opportunity</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Volunteer Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.event_title}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    {opportunity.current_volunteers}/{opportunity.max_volunteers} volunteers
                  </span>
                </div>
                <CardDescription>{opportunity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(opportunity.start_time)} - {formatDate(opportunity.end_time)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {opportunity.time_commitment}
                  </div>
                  {opportunity.required_skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.required_skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Volunteer Signups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Volunteer Signups</CardTitle>
            <CardDescription>Manage volunteer applications and confirmations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signups.map((signup) => (
                <div key={signup.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{signup.user_name}</p>
                        <p className="text-sm text-gray-600">{signup.user_email}</p>
                        {signup.notes && (
                          <p className="text-sm text-gray-500 mt-1">{signup.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(signup.status)}`}>
                        {signup.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

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
  XCircle,
  Sparkles,
  Star,
  Zap,
  Gift,
  Target,
  Award,
  Bell
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

  // Fetch volunteer data from API
  useEffect(() => {
    const fetchVolunteerData = async () => {
      try {
        // Fetch volunteer opportunities
        const opportunitiesResponse = await fetch('/api/volunteers/opportunities')
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json()
          setOpportunities(opportunitiesData.opportunities || [])
        }

        // Fetch volunteer signups
        const signupsResponse = await fetch('/api/volunteers/signups')
        if (signupsResponse.ok) {
          const signupsData = await signupsResponse.json()
          setSignups(signupsData.signups || [])
        }
      } catch (error) {
        console.error('Error fetching volunteer data:', error)
        setOpportunities([])
        setSignups([])
      } finally {
        setLoading(false)
      }
    }

    fetchVolunteerData()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <Heart className="h-16 w-16 text-pink-500 bounce-animation mx-auto mb-4" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gradient font-semibold">Loading volunteer opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
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
              <Link href="/dashboard">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Dashboard</Button>
              </Link>
              <Link href="/events">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Management</h1>
            <p className="text-gray-600">Manage volunteer opportunities and sign-ups</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Button>
        </div>

        {/* Create Opportunity Form */}
        {showCreateForm && (
          <Card className="mb-8 card-soft hover:card-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900">Create Volunteer Opportunity</CardTitle>
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
            <Card key={opportunity.id} className="card-soft hover:card-elevated transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-gray-900">{opportunity.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.event_title}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                    {opportunity.current_volunteers}/{opportunity.max_volunteers} volunteers
                  </span>
                </div>
                <CardDescription>{opportunity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">{formatDate(opportunity.start_time)} - {formatDate(opportunity.end_time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-green-50 transition-colors">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">{opportunity.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-purple-50 transition-colors">
                    <Clock className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-medium">{opportunity.time_commitment}</span>
                  </div>
                  {opportunity.required_skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.required_skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold">
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
        <Card className="card-soft hover:card-elevated transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Volunteer Signups</CardTitle>
            <CardDescription>Manage volunteer applications and confirmations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signups.map((signup) => (
                <div key={signup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-gray-900">{signup.user_name}</p>
                        <p className="text-sm text-gray-600">{signup.user_email}</p>
                        {signup.notes && (
                          <p className="text-sm text-gray-500 mt-1">{signup.notes}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(signup.status)}`}>
                        {signup.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
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

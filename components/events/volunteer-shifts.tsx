'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle,
  Sparkles,
  Heart,
  Star,
  Zap,
  Shield,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  ExternalLink,
  Target,
  Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import { trackVolunteerSignup } from '@/lib/analytics'
import { MonitoringService } from '@/lib/monitoring'

interface VolunteerShift {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  max_volunteers: number
  current_volunteers: number
  requirements: string
  skills_needed: string[]
  location: string
  is_active: boolean
}

interface VolunteerShiftsProps {
  eventId: string
  eventTitle: string
  onSignupSuccess?: () => void
}

export function VolunteerShifts({ eventId, eventTitle, onSignupSuccess }: VolunteerShiftsProps) {
  const [shifts, setShifts] = useState<VolunteerShift[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState<VolunteerShift | null>(null)
  const [showSignupForm, setShowSignupForm] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const [signupId, setSignupId] = useState<string | null>(null)

  // Signup form state
  const [volunteerName, setVolunteerName] = useState('')
  const [volunteerEmail, setVolunteerEmail] = useState('')
  const [volunteerPhone, setVolunteerPhone] = useState('')
  const [skills, setSkills] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('beginner')
  const [availabilityNotes, setAvailabilityNotes] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchVolunteerShifts = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/volunteer-shifts`)
      if (response.ok) {
        const data = await response.json()
        setShifts(data.shifts || [])
      }
    } catch (error) {
      console.error('Error fetching volunteer shifts:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchVolunteerShifts()
  }, [fetchVolunteerShifts])

  const handleShiftSignup = (shift: VolunteerShift) => {
    setSelectedShift(shift)
    setShowSignupForm(true)
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!volunteerName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!volunteerEmail.trim()) {
      toast.error('Please enter your email address')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(volunteerEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!selectedShift) return

    setIsSubmitting(true)

    try {
      // Track volunteer signup attempt
      trackVolunteerSignup(eventId, eventTitle, selectedShift.id, volunteerEmail)

      const response = await fetch('/api/events/volunteer-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shift_id: selectedShift.id,
          volunteer_name: volunteerName.trim(),
          volunteer_email: volunteerEmail.trim(),
          volunteer_phone: volunteerPhone.trim(),
          skills: skills.trim().split(',').map(s => s.trim()).filter(Boolean),
          experience_level: experienceLevel,
          availability_notes: availabilityNotes.trim(),
          emergency_contact_name: emergencyContactName.trim(),
          emergency_contact_phone: emergencyContactPhone.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up for volunteer shift')
      }

      setSignupId(data.signup_id)
      setSignupComplete(true)
      toast.success('Volunteer signup confirmed! Check your email for details.')
      onSignupSuccess?.()

    } catch (error) {
      console.error('Volunteer signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sign up for volunteer shift')
      
      // Track signup failure
      MonitoringService.trackCriticalError(
        error instanceof Error ? error : new Error('Unknown volunteer signup error'),
        {
          event_id: eventId,
          shift_id: selectedShift.id,
          volunteer_email: volunteerEmail,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getSkillsColor = (skill: string) => {
    const colors = {
      'setup': 'bg-blue-100 text-blue-800',
      'coordination': 'bg-green-100 text-green-800',
      'cleanup': 'bg-orange-100 text-orange-800',
      'customer_service': 'bg-purple-100 text-purple-800',
      'communication': 'bg-pink-100 text-pink-800',
      'decorating': 'bg-yellow-100 text-yellow-800',
      'organization': 'bg-indigo-100 text-indigo-800',
      'teamwork': 'bg-red-100 text-red-800'
    }
    return colors[skill as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (signupComplete && selectedShift) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-900">Volunteer Signup Confirmed!</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Thank you for volunteering your time and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-2">Shift Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{selectedShift.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formatTime(selectedShift.start_time)} - {formatTime(selectedShift.end_time)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{selectedShift.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-green-700 mb-4">
                You&apos;ll receive a confirmation email with all the details. Thank you for making a difference!
              </p>
              <Button
                onClick={() => {
                  setSignupComplete(false)
                  setShowSignupForm(false)
                  setSelectedShift(null)
                }}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                Sign Up for Another Shift
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showSignupForm && selectedShift) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">Volunteer Signup</CardTitle>
              <CardDescription className="text-blue-700">
                {selectedShift.title} - {formatTime(selectedShift.start_time)}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSignupForm(false)
                setSelectedShift(null)
              }}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Back to Shifts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volunteerName" className="text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="volunteerName"
                  type="text"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="volunteerEmail" className="text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="volunteerEmail"
                  type="email"
                  value={volunteerEmail}
                  onChange={(e) => setVolunteerEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volunteerPhone" className="text-gray-700">
                  Phone Number
                </Label>
                <Input
                  id="volunteerPhone"
                  type="tel"
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="experienceLevel" className="text-gray-700">
                  Experience Level
                </Label>
                <select
                  id="experienceLevel"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="skills" className="text-gray-700">
                Skills (comma-separated)
              </Label>
              <Input
                id="skills"
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., customer service, organization, communication"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="availabilityNotes" className="text-gray-700">
                Availability Notes
              </Label>
              <Input
                id="availabilityNotes"
                type="text"
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                placeholder="Any notes about your availability"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName" className="text-gray-700">
                  Emergency Contact Name
                </Label>
                <Input
                  id="emergencyContactName"
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Emergency contact name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="emergencyContactPhone" className="text-gray-700">
                  Emergency Contact Phone
                </Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="Emergency contact phone"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-2">Volunteer Agreement</p>
                  <ul className="space-y-1 text-xs">
                    <li>• You agree to arrive on time and fulfill your volunteer commitment</li>
                    <li>• You understand this is a volunteer position with no compensation</li>
                    <li>• You consent to being photographed during volunteer activities</li>
                    <li>• Contact information will be used for volunteer coordination only</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing Up...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Sign Up to Volunteer
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSignupForm(false)
                  setSelectedShift(null)
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading volunteer shifts...</p>
      </div>
    )
  }

  if (shifts.length === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Volunteer Shifts Available</h3>
          <p className="text-gray-600">
            There are currently no volunteer shifts for this event. Check back later or contact the organizer.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Volunteer Opportunities</h2>
        <p className="text-gray-600">
          Help make this event amazing by volunteering your time and skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift) => {
          const spotsRemaining = shift.max_volunteers - shift.current_volunteers
          const isFull = spotsRemaining <= 0
          const isActive = shift.is_active

          return (
            <Card 
              key={shift.id} 
              className={`border-2 transition-all duration-200 hover:shadow-lg ${
                isFull 
                  ? 'border-red-200 bg-red-50' 
                  : isActive 
                    ? 'border-blue-200 bg-blue-50 hover:border-blue-300' 
                    : 'border-gray-200 bg-gray-50'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-gray-900 mb-1">{shift.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      {shift.description}
                    </CardDescription>
                  </div>
                  {isFull && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Full</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{formatTime(shift.start_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium truncate">{shift.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Volunteers:</span>
                    <span className="font-medium">
                      {shift.current_volunteers}/{shift.max_volunteers}
                    </span>
                  </div>
                </div>

                {shift.requirements && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-900 mb-1">Requirements:</p>
                    <p className="text-xs text-gray-600">{shift.requirements}</p>
                  </div>
                )}

                {shift.skills_needed && shift.skills_needed.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-2">Skills Needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {shift.skills_needed.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillsColor(skill)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleShiftSignup(shift)}
                  disabled={isFull || !isActive}
                  className={`w-full ${
                    isFull 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : !isActive 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : ''
                  }`}
                >
                  {isFull ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Shift Full
                    </>
                  ) : !isActive ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Not Available
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Sign Up to Volunteer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

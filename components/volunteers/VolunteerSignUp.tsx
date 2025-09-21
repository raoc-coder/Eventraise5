'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin,
  CheckCircle,
  User,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

interface VolunteerSignUpProps {
  opportunityId: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  maxVolunteers: number
  currentVolunteers: number
  requiredSkills: string[]
  onSuccess?: (signup: any) => void
}

export default function VolunteerSignUp({
  opportunityId,
  title,
  description,
  startTime,
  endTime,
  location,
  maxVolunteers,
  currentVolunteers,
  requiredSkills,
  onSuccess
}: VolunteerSignUpProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    experience: '',
    availability: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const spotsRemaining = maxVolunteers - currentVolunteers
  const isFullyBooked = spotsRemaining <= 0

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    
    try {
      // Here you would integrate with your backend API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const signup = {
        opportunityId,
        title,
        volunteerName: formData.fullName,
        volunteerEmail: formData.email,
        volunteerPhone: formData.phone,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        experience: formData.experience,
        availability: formData.availability,
        notes: formData.notes
      }
      
      toast.success('Volunteer signup successful! You\'ll receive a confirmation email shortly.')
      setStep('success')
      onSuccess?.(signup)
    } catch (error) {
      toast.error('Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
      experience: '',
      availability: '',
      notes: ''
    })
    setStep('form')
  }

  if (isFullyBooked) {
    return (
      <Card className="card-soft">
        <CardHeader>
          <CardTitle className="text-white">Volunteer Opportunity</CardTitle>
          <CardDescription className="text-gray-300">{title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fully Booked</h3>
            <p className="text-gray-400 mb-4">This volunteer opportunity has reached maximum capacity.</p>
            <Button variant="outline" className="text-gray-400 cursor-not-allowed" disabled>
              Registration Closed
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-soft">
      <CardHeader>
        <CardTitle className="text-white">Volunteer Sign-Up</CardTitle>
        <CardDescription className="text-gray-300">{title}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opportunity Details */}
            <div className="bg-gray-800/30 p-4 rounded-lg space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <Calendar className="h-4 w-4 text-cyan-400 mr-2" />
                <span>{formatDate(startTime)} - {formatDate(endTime)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-orange-400 mr-2" />
                <span>{location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Users className="h-4 w-4 text-cyan-400 mr-2" />
                <span>{spotsRemaining} spots remaining</span>
              </div>
              {requiredSkills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-orange-400 mb-1">Required Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {requiredSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold flex items-center">
                <User className="h-4 w-4 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-gray-300">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    type="text"
                    placeholder="Emergency contact name"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone" className="text-gray-300">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="Emergency contact phone"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Experience & Availability */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Experience & Availability</h3>
              
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-gray-300">Relevant Experience</Label>
                <textarea
                  id="experience"
                  placeholder="Describe any relevant experience or skills..."
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability" className="text-gray-300">Availability Notes</Label>
                <textarea
                  id="availability"
                  placeholder="Any specific availability constraints or preferences..."
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-gray-300">Additional Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Any additional information or special requests..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={2}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-primary">
              <Users className="h-4 w-4 mr-2" />
              {loading ? 'Signing Up...' : 'Sign Up as Volunteer'}
            </Button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sign-Up Successful!</h3>
            <p className="text-gray-300 mb-6">
              Thank you for volunteering! You&apos;ll receive a confirmation email with event details.
            </p>
            <div className="space-y-2">
              <Button onClick={resetForm} className="btn-primary">
                Sign Up for Another Opportunity
              </Button>
              <Button variant="outline" className="w-full text-cyan-400 hover:bg-cyan-500/20">
                View All Opportunities
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

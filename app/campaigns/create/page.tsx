'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Heart, 
  ArrowLeft,
  ArrowRight,
  Upload,
  DollarSign,
  Calendar,
  Target,
  Users,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface CampaignForm {
  title: string
  description: string
  goal_amount: string
  start_date: string
  end_date: string
  category: string
  organization_name: string
  image_url: string
  is_featured: boolean
}

const categories = [
  'Education',
  'Healthcare',
  'Environment',
  'Community',
  'Sports',
  'Arts & Culture',
  'Emergency Relief',
  'Other'
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CampaignForm>({
    title: '',
    description: '',
    goal_amount: '',
    start_date: '',
    end_date: '',
    category: '',
    organization_name: '',
    image_url: '',
    is_featured: false
  })

  const handleInputChange = (field: keyof CampaignForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Here you would integrate with your backend API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Campaign created successfully!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to create campaign. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.category
      case 2:
        return formData.goal_amount && formData.start_date && formData.end_date && formData.organization_name
      case 3:
        return true
      default:
        return false
    }
  }

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
              <Link href="/dashboard">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Create Campaign</h1>
            <span className="text-gray-400">Step {currentStep} of 3</span>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-cyan-400 to-orange-400' 
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Campaign Details</CardTitle>
                <CardDescription className="text-gray-300">
                  Tell us about your campaign and what you&apos;re raising funds for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Campaign Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Spring School Playground Renovation"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your campaign, why it's important, and how the funds will be used..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-300">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Financial & Timeline */}
          {currentStep === 2 && (
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Financial Goals & Timeline</CardTitle>
                <CardDescription className="text-gray-300">
                  Set your fundraising target and campaign duration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="goal_amount" className="text-gray-300">Fundraising Goal *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="goal_amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.goal_amount}
                        onChange={(e) => handleInputChange('goal_amount', e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization_name" className="text-gray-300">Organization Name *</Label>
                    <Input
                      id="organization_name"
                      type="text"
                      placeholder="e.g., Lincoln Elementary School"
                      value={formData.organization_name}
                      onChange={(e) => handleInputChange('organization_name', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-gray-300">Campaign Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-gray-300">Campaign End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Media & Settings */}
          {currentStep === 3 && (
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-white">Media & Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Add a campaign image and configure additional settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-gray-300">Campaign Image</Label>
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Upload a campaign image</p>
                    <p className="text-gray-400 text-sm mb-4">Recommended size: 1200x630px</p>
                    <Button type="button" variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <Label htmlFor="is_featured" className="text-gray-300">
                    Feature this campaign on the homepage (additional fee may apply)
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="btn-primary"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !isStepValid(currentStep)}
                className="btn-primary"
              >
                {loading ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

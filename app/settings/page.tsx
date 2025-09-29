'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Heart, 
  Save,
  Upload,
  CreditCard,
  Building,
  User,
  Shield,
  Bell,
  Globe,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface SchoolProfile {
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  logo_url: string
  description: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  brand: string
  isDefault: boolean
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    logo_url: '',
    description: ''
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [notifications, setNotifications] = useState({
    emailDonations: true,
    emailEvents: true,
    emailReports: false,
    smsAlerts: false
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch school profile
        const profileResponse = await fetch('/api/settings/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setSchoolProfile(profileData.profile)
        }

        // Fetch payment methods
        const paymentResponse = await fetch('/api/settings/payment-methods')
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json()
          setPaymentMethods(paymentData.paymentMethods || [])
        }
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfileData()
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Here you would integrate with your backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSave = async () => {
    setLoading(true)
    
    try {
      // Here you would integrate with your backend API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notification preferences updated!')
    } catch (error) {
      toast.error('Failed to update preferences. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'School Profile', icon: Building },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your school profile and account preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-soft">
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-cyan-500/20 text-cyan-400 border-r-2 border-cyan-400'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* School Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle className="text-white">School Profile</CardTitle>
                  <CardDescription className="text-gray-300">
                    Update your school information and branding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">School Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={schoolProfile.name}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Contact Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={schoolProfile.email}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-gray-300">Address</Label>
                      <Input
                        id="address"
                        type="text"
                        value={schoolProfile.address}
                        onChange={(e) => setSchoolProfile(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-gray-300">City</Label>
                        <Input
                          id="city"
                          type="text"
                          value={schoolProfile.city}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-gray-300">State</Label>
                        <Input
                          id="state"
                          type="text"
                          value={schoolProfile.state}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-gray-300">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          type="text"
                          value={schoolProfile.zipCode}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={schoolProfile.phone}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-gray-300">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={schoolProfile.website}
                          onChange={(e) => setSchoolProfile(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-300">School Description</Label>
                      <textarea
                        id="description"
                        value={schoolProfile.description}
                        onChange={(e) => setSchoolProfile(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px]"
                        placeholder="Tell us about your school..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">School Logo</Label>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-cyan-400 transition-colors">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 mb-2">Upload your school logo</p>
                        <p className="text-gray-400 text-sm mb-4">Recommended size: 200x200px</p>
                        <Button type="button" variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle className="text-white">Payment Methods</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your payment methods for receiving donations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-cyan-400 mr-3" />
                          <div>
                            <p className="text-white font-semibold">
                              {method.brand} •••• {method.last4}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {method.type === 'card' ? 'Credit Card' : 'Bank Account'}
                              {method.isDefault && ' • Default'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && (
                            <Button variant="outline" size="sm" className="text-cyan-400 hover:bg-cyan-500/20">
                              Set Default
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="text-red-400 hover:bg-red-500/20">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button className="btn-primary">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle className="text-white">Notification Preferences</CardTitle>
                  <CardDescription className="text-gray-300">
                    Choose how you want to be notified about activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">Email Notifications</p>
                          <p className="text-gray-400 text-sm">Receive updates via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailDonations}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailDonations: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">New Donations</p>
                          <p className="text-gray-400 text-sm">Get notified when someone donates</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailEvents}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailEvents: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">Weekly Reports</p>
                          <p className="text-gray-400 text-sm">Receive weekly performance summaries</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailReports}
                          onChange={(e) => setNotifications(prev => ({ ...prev, emailReports: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">SMS Alerts</p>
                          <p className="text-gray-400 text-sm">Receive urgent notifications via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.smsAlerts}
                          onChange={(e) => setNotifications(prev => ({ ...prev, smsAlerts: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <Button onClick={handleNotificationSave} disabled={loading} className="btn-primary">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your account security and privacy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current_password" className="text-gray-300">Current Password</Label>
                        <Input
                          id="current_password"
                          type="password"
                          placeholder="Enter current password"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new_password" className="text-gray-300">New Password</Label>
                        <Input
                          id="new_password"
                          type="password"
                          placeholder="Enter new password"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm_password" className="text-gray-300">Confirm New Password</Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          placeholder="Confirm new password"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-600 pt-6">
                      <h3 className="text-white font-semibold mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Enable 2FA</p>
                          <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                          Enable
                        </Button>
                      </div>
                    </div>

                    <Button className="btn-primary">
                      <Shield className="h-4 w-4 mr-2" />
                      Update Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

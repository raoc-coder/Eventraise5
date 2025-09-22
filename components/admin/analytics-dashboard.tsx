'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Users, 
  Calendar,
  Heart,
  Target,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  Sparkles,
  Award,
  Zap,
  Star,
  Gift,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { CSVExportService } from '@/lib/csv-export'
import toast from 'react-hot-toast'

interface AnalyticsData {
  summary: {
    totalDonations: number
    totalDonationAmount: number
    averageDonation: number
    totalRegistrations: number
    totalRegistrationAmount: number
    averageRegistration: number
    totalVolunteers: number
    confirmedVolunteers: number
    totalRevenue: number
  }
  monthlyData: Array<{
    month: string
    donations: number
    registrations: number
    revenue: number
  }>
  campaignPerformance: Array<{
    id: string
    title: string
    goal_amount: number
    current_amount: number
    progress_percentage: number
    donation_count: number
    created_at: string
  }>
  eventPerformance: Array<{
    id: string
    title: string
    start_date: string
    end_date: string
    max_participants: number
    current_participants: number
    capacity_percentage: number
    ticket_price: number
    registration_count: number
  }>
}

interface AnalyticsDashboardProps {
  initialData?: AnalyticsData
  onRefresh?: () => void
}

export function AnalyticsDashboard({ initialData, onRefresh }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    campaignId: '',
    eventId: ''
  })
  const [exportLoading, setExportLoading] = useState(false)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: 'comprehensive',
          filters
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const result = await response.json()
      setData(result.data)
      onRefresh?.()
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'donations' | 'event-registrations' | 'volunteers' | 'campaign-analytics') => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams({
        type,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.campaignId && { campaignId: filters.campaignId }),
        ...(filters.eventId && { eventId: filters.eventId }),
        includePersonalData: 'true'
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success(`${type} exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setExportLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">Analytics Filters</CardTitle>
              <CardDescription className="text-blue-700">
                Customize your analytics view
              </CardDescription>
            </div>
            <Button
              onClick={fetchAnalytics}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-gray-700">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-gray-700">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="campaignId" className="text-gray-700">Campaign ID</Label>
              <Input
                id="campaignId"
                type="text"
                value={filters.campaignId}
                onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
                placeholder="Filter by campaign"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="eventId" className="text-gray-700">Event ID</Label>
              <Input
                id="eventId"
                type="text"
                value={filters.eventId}
                onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}
                placeholder="Filter by event"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-900 text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(data.summary.totalRevenue)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              From donations and registrations
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-900 text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {data.summary.totalDonations.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Average: {formatCurrency(data.summary.averageDonation)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-900 text-sm font-medium">Event Registrations</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {data.summary.totalRegistrations.toLocaleString()}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Revenue: {formatCurrency(data.summary.totalRegistrationAmount)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-900 text-sm font-medium">Volunteers</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {data.summary.totalVolunteers.toLocaleString()}
            </div>
            <p className="text-xs text-orange-700 mt-1">
              {data.summary.confirmedVolunteers} confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-gray-900">Export Data</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Download comprehensive reports in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleExport('donations')}
              disabled={exportLoading}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <Heart className="h-4 w-4 mr-2" />
              Donations
            </Button>
            <Button
              onClick={() => handleExport('event-registrations')}
              disabled={exportLoading}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Registrations
            </Button>
            <Button
              onClick={() => handleExport('volunteers')}
              disabled={exportLoading}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Volunteers
            </Button>
            <Button
              onClick={() => handleExport('campaign-analytics')}
              disabled={exportLoading}
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance */}
      {data.campaignPerformance.length > 0 && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Campaign Performance</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Top performing fundraising campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.campaignPerformance.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-green-600">
                        {formatPercentage(campaign.progress_percentage)}
                      </span>
                      <Target className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Raised:</span>
                      <span className="font-medium ml-1">{formatCurrency(campaign.current_amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-medium ml-1">{formatCurrency(campaign.goal_amount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Donations:</span>
                      <span className="font-medium ml-1">{campaign.donation_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium ml-1">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Performance */}
      {data.eventPerformance.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Event Performance</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              Upcoming and recent events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.eventPerformance.slice(0, 5).map((event) => (
                <div key={event.id} className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-blue-600">
                        {formatPercentage(event.capacity_percentage)}
                      </span>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium ml-1">
                        {new Date(event.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium ml-1">
                        {event.current_participants}/{event.max_participants}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium ml-1">{formatCurrency(event.ticket_price)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Registrations:</span>
                      <span className="font-medium ml-1">{event.registration_count}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(event.capacity_percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Revenue Chart */}
      {data.monthlyData.length > 0 && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-900">Monthly Revenue</CardTitle>
            </div>
            <CardDescription className="text-purple-700">
              Revenue breakdown by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.monthlyData.slice(-6).map((month) => (
                <div key={month.month} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <span className="text-lg font-bold text-purple-600">
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Donations:</span>
                      <span className="font-medium ml-1">{month.donations}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Registrations:</span>
                      <span className="font-medium ml-1">{month.registrations}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium ml-1">{month.donations + month.registrations}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

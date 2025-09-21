'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Heart, 
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface ReportData {
  totalRevenue: number
  totalDonations: number
  totalEvents: number
  totalParticipants: number
  averageDonation: number
  topCampaigns: Array<{
    id: string
    title: string
    amount: number
    donors: number
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
  }>
  donationSources: Array<{
    source: string
    percentage: number
    amount: number
  }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [selectedReport, setSelectedReport] = useState('overview')

  useEffect(() => {
    // Mock data for demonstration
    const mockData: ReportData = {
      totalRevenue: 125750,
      totalDonations: 342,
      totalEvents: 8,
      totalParticipants: 1247,
      averageDonation: 367.84,
      topCampaigns: [
        { id: '1', title: 'Spring Playground Renovation', amount: 25000, donors: 127 },
        { id: '2', title: 'School Technology Upgrade', amount: 18000, donors: 89 },
        { id: '3', title: 'Library Book Drive', amount: 12000, donors: 156 }
      ],
      monthlyRevenue: [
        { month: 'Jan', revenue: 8500 },
        { month: 'Feb', revenue: 12000 },
        { month: 'Mar', revenue: 18500 },
        { month: 'Apr', revenue: 22000 },
        { month: 'May', revenue: 16800 },
        { month: 'Jun', revenue: 19950 }
      ],
      donationSources: [
        { source: 'Online Donations', percentage: 65, amount: 81737 },
        { source: 'Event Tickets', percentage: 25, amount: 31437 },
        { source: 'Corporate Sponsors', percentage: 10, amount: 12576 }
      ]
    }
    
    setTimeout(() => {
      setReportData(mockData)
      setLoading(false)
    }, 1000)
  }, [])

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // Here you would implement the actual export functionality
    console.log(`Exporting ${selectedReport} report as ${format}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading reports...</p>
        </div>
      </div>
    )
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
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Dashboard</Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" className="text-cyan-400 hover:text-white hover:bg-cyan-500/20">Admin</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-300">Comprehensive insights into your fundraising performance</p>
        </div>

        {/* Report Controls */}
        <Card className="card-soft mb-8">
          <CardHeader>
            <CardTitle className="text-white">Report Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-gray-300">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-gray-300">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report_type" className="text-gray-300">Report Type</Label>
                <select
                  id="report_type"
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="overview">Overview</option>
                  <option value="financial">Financial</option>
                  <option value="events">Events</option>
                  <option value="donors">Donors</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" className="text-cyan-400 hover:bg-cyan-500/20">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button className="btn-primary">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                ${reportData?.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {reportData?.totalDonations}
              </div>
              <p className="text-xs text-gray-400">+8.2% from last month</p>
            </CardContent>
          </Card>

          <Card className="card-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {reportData?.totalEvents}
              </div>
              <p className="text-xs text-gray-400">3 ending this week</p>
            </CardContent>
          </Card>

          <Card className="card-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Participants</CardTitle>
              <Users className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {reportData?.totalParticipants}
              </div>
              <p className="text-xs text-gray-400">+15.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Campaigns */}
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Top Performing Campaigns</CardTitle>
              <CardDescription className="text-gray-300">Highest revenue generating campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.topCampaigns.map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{campaign.title}</p>
                        <p className="text-gray-400 text-sm">{campaign.donors} donors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">${campaign.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Revenue Chart */}
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Monthly Revenue</CardTitle>
              <CardDescription className="text-gray-300">Revenue trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.monthlyRevenue.map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">{month.month}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-orange-400 h-2 rounded-full"
                          style={{ width: `${(month.revenue / 25000) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold w-16 text-right">
                        ${month.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Donation Sources */}
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Donation Sources</CardTitle>
              <CardDescription className="text-gray-300">Breakdown of revenue by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.donationSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">{source.source}</span>
                      <span className="text-white font-semibold">{source.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-gradient-to-r from-cyan-400 to-blue-500' :
                          index === 1 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                          'bg-gradient-to-r from-green-400 to-teal-500'
                        }`}
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm">${source.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-300">Generate and export reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full justify-start btn-primary">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Financial Report
                </Button>
                <Button variant="outline" className="w-full justify-start text-cyan-400 hover:bg-cyan-500/20">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Analytics Data
                </Button>
                <Button variant="outline" className="w-full justify-start text-cyan-400 hover:bg-cyan-500/20">
                  <PieChart className="h-4 w-4 mr-2" />
                  Download Donor List
                </Button>
                <Button variant="outline" className="w-full justify-start text-cyan-400 hover:bg-cyan-500/20">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

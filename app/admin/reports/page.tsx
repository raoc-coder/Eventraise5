'use client'

import { Navigation } from '@/components/layout/navigation'
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="display text-gray-900 mb-2">Admin Reports & Analytics</h1>
          <p className="text-gray-600 text-lg">Comprehensive insights and data exports for EventraiseHUB</p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
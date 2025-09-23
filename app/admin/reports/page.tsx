import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="display text-gray-900 mb-2">Admin Reports & Analytics</h1>
          <p className="text-gray-600 text-lg">Comprehensive insights for EventraiseHUB</p>
        </div>
        
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-900">Reports Coming Soon</CardTitle>
            <CardDescription className="text-gray-600">
              Analytics and reporting features are being developed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This section will provide comprehensive analytics for events, volunteers, and donations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
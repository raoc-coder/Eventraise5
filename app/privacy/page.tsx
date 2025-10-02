import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Lock, Database, Users, Mail } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your privacy and data security are our top priorities
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-cyan-600" />
                Our Commitment to Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Event Raise is committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
                our platform to create campaigns, make donations, or participate in events.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Database className="h-6 w-6 mr-2 text-orange-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-cyan-700 mb-2">Personal Information</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Name and email address (required for account creation)</li>
                  <li>• Organization name (optional, for campaign creators)</li>
                  <li>• Payment information (processed securely through PayPal)</li>
                  <li>• Profile information you choose to share</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-700 mb-2">Usage Information</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Campaign and event participation data</li>
                  <li>• Donation history and amounts</li>
                  <li>• Platform usage patterns and preferences</li>
                  <li>• Communication preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-green-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-3">Platform Operations</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Process donations and payments</li>
                    <li>• Manage campaigns and events</li>
                    <li>• Provide customer support</li>
                    <li>• Send important notifications</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-3">Communication</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Send campaign updates</li>
                    <li>• Provide donation receipts</li>
                    <li>• Share platform improvements</li>
                    <li>• Respond to inquiries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-red-600" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">Technical Safeguards</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• HTTPS encryption for all data transmission</li>
                    <li>• Secure database with Row Level Security (RLS)</li>
                    <li>• PCI-compliant payment processing via PayPal</li>
                    <li>• Regular security audits and updates</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 mb-3">Access Controls</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Multi-factor authentication support</li>
                    <li>• Role-based access permissions</li>
                    <li>• Secure API endpoints</li>
                    <li>• Audit logging for sensitive operations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-yellow-600" />
                Information Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information only in these limited circumstances:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>• <strong>Campaign Organizers:</strong> Donor information (name, amount) for campaign management</li>
                <li>• <strong>Payment Processing:</strong> Necessary information with PayPal for transaction processing</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li>• <strong>Service Providers:</strong> Trusted partners who assist in platform operations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-700 mb-3">Access & Control</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• View and update your profile information</li>
                    <li>• Access your donation history</li>
                    <li>• Download your data</li>
                    <li>• Delete your account</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-3">Communication Preferences</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Opt out of marketing emails</li>
                    <li>• Control notification settings</li>
                    <li>• Manage campaign updates</li>
                    <li>• Update contact preferences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Mail className="h-6 w-6 mr-2 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>Email: privacy@eventraise.com</p>
                <p>Address: [Your Business Address]</p>
                <p>Phone: [Your Contact Number]</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

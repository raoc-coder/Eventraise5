import { Navigation } from '@/components/layout/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Shield, AlertTriangle, Users, CreditCard, Gavel } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Please read these terms carefully before using Event Raise
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
                <FileText className="h-6 w-6 mr-2 text-cyan-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Event Raise (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform. These terms apply to all users, 
                including campaign creators, donors, and event participants.
              </p>
            </CardContent>
          </Card>

          {/* Platform Description */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-orange-600" />
                Platform Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Event Raise is a crowdfunding and event management platform that enables users to:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>• Create and manage fundraising campaigns</li>
                <li>• Organize and promote events</li>
                <li>• Make secure donations to campaigns</li>
                <li>• Register for events and activities</li>
                <li>• Connect with like-minded individuals and organizations</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-green-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-3">Account Security</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Maintain accurate and up-to-date account information</li>
                  <li>• Keep your login credentials secure and confidential</li>
                  <li>• Notify us immediately of any unauthorized account access</li>
                  <li>• Use strong, unique passwords for your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Content Guidelines</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Provide truthful and accurate information in campaigns and events</li>
                  <li>• Respect intellectual property rights of others</li>
                  <li>• Do not post offensive, illegal, or harmful content</li>
                  <li>• Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">The following activities are strictly prohibited:</p>
              <ul className="text-gray-700 space-y-2">
                <li>• Creating fraudulent or misleading campaigns</li>
                <li>• Using the platform for illegal activities</li>
                <li>• Harassing, threatening, or abusing other users</li>
                <li>• Attempting to circumvent platform security measures</li>
                <li>• Spamming or sending unsolicited communications</li>
                <li>• Violating any applicable laws or regulations</li>
                <li>• Impersonating other individuals or organizations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-700 mb-3">Donations</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• All donations are final and non-refundable unless otherwise stated</li>
                  <li>• Payment processing is handled securely through Stripe</li>
                  <li>• Use of the platform is free. A platform fee of 8.99% applies to donations received (plus Stripe fees).</li>
                  <li>• Donors will receive receipts for tax purposes</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-700 mb-3">Campaign Funds</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Campaign organizers are responsible for using funds as described</li>
                  <li>• We reserve the right to investigate misuse of funds</li>
                  <li>• Campaign creators must provide updates on fund usage</li>
                  <li>• Refunds are at the discretion of campaign organizers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Platform Fees */}
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="text-white">Platform Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">Current Fee Structure</h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• <strong>Donors:</strong> No fees charged to donors</li>
                    <li>• <strong>Campaign Creators:</strong> 2.9% + $0.30 per transaction</li>
                    <li>• <strong>Event Organizers:</strong> 3.5% + $0.30 per registration</li>
                    <li>• <strong>Payment Processing:</strong> Handled by Stripe (additional fees may apply)</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-400">
                  Fee structure is subject to change with 30 days notice. Current fees are displayed at the time of campaign creation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Gavel className="h-6 w-6 mr-2 text-yellow-600" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-yellow-700 mb-3">Platform Availability</h3>
                <p className="text-gray-700">
                  We strive to maintain platform availability but cannot guarantee uninterrupted service. 
                  We reserve the right to modify, suspend, or discontinue any part of the platform at any time.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-red-700 mb-3">Campaign Responsibility</h3>
                <p className="text-gray-700">
                  Event Raise is not responsible for the success or failure of campaigns, the accuracy of campaign information, 
                  or the use of donated funds. Campaign creators are solely responsible for their campaigns and fund usage.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-orange-700 mb-3">Limitation of Liability</h3>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, Event Raise shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages arising from your use of the platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Account Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-700 mb-3">By You</h3>
                  <p className="text-gray-700">
                    You may terminate your account at any time by contacting us. Upon termination, 
                    your access to the platform will be revoked, but your donation history will be preserved for record-keeping.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-3">By Us</h3>
                  <p className="text-gray-700">
                    We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities. 
                    We will provide notice when possible and explain the reason for termination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update these Terms of Service from time to time. We will notify users of significant changes 
                via email or platform notification. Continued use of the platform after changes constitutes acceptance 
                of the new terms. We encourage you to review these terms periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="event-card">
            <CardHeader>
              <CardTitle className="text-gray-900">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>Email: legal@eventraise.com</p>
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

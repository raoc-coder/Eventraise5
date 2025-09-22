'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Briefcase } from 'lucide-react'

const featuresFree = [
  'Unlimited events (community tier)',
  'Volunteer management basics',
  'Donor wall & leaderboard (read-only)',
  'Email support (community)',
]

const featuresPro = [
  'Advanced event analytics & insights',
  'Engagement-first donation experience',
  'Impact widgets and verification requests',
  'Priority support',
]

const featuresCustom = [
  'Stripe Connect with managed payouts',
  'Smart KYC/AML & audit trail',
  'Custom SLAs and onboarding',
  'Dedicated success manager',
]

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [annual, setAnnual] = useState(false)
  const [trial, setTrial] = useState(true)

  const handleStartPro = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro', interval: annual ? 'annual' : 'monthly', trial }),
      })
      if (!res.ok) {
        throw new Error('Failed to start checkout')
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Checkout URL missing')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-300">Start free. Upgrade when you need more power.</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm ${!annual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative inline-flex h-6 w-12 items-center rounded-full bg-white/10 hover:bg-white/15 transition"
            aria-label="Toggle annual billing"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${annual ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className={`text-sm ${annual ? 'text-white' : 'text-gray-400'}`}>Annual <span className="text-green-400">(save)</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" /> Free
              </CardTitle>
              <CardDescription className="text-gray-400">For early-stage organizers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold mb-4">$0<span className="text-lg font-medium text-gray-400">/mo</span></div>
              <div className="text-xs text-gray-400 mb-4">Platform fee: 8.99% of donations collected (excl. Stripe fees)</div>
              <ul className="space-y-2 mb-6">
                {featuresFree.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-300"><Check className="h-4 w-4 text-green-400 mt-1" />{f}</li>
                ))}
              </ul>
              <a href="/auth/register">
                <Button className="w-full btn-secondary">Get started</Button>
              </a>
            </CardContent>
          </Card>

          <Card className="card-elevated border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" /> Pro
              </CardTitle>
              <CardDescription className="text-gray-400">For growing teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold mb-1">{annual ? '$290' : '$29'}<span className="text-lg font-medium text-gray-400">{annual ? '/yr' : '/mo'}</span></div>
              {annual && <div className="text-green-400 text-sm mb-3">2 months free</div>}
              <div className="text-xs text-gray-400 mb-4">Platform fee: 8.99% of donations collected (excl. Stripe fees)</div>
              <ul className="space-y-2 mb-6">
                {featuresPro.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-300"><Check className="h-4 w-4 text-green-400 mt-1" />{f}</li>
                ))}
              </ul>
              <div className="flex items-center gap-2 mb-3">
                <input id="trial" type="checkbox" checked={trial} onChange={() => setTrial(!trial)} className="h-4 w-4" />
                <label htmlFor="trial" className="text-sm text-gray-300">Start with free trial</label>
              </div>
              <Button onClick={handleStartPro} disabled={loading} className="w-full btn-primary">
                {loading ? 'Redirecting…' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-400" /> Custom
              </CardTitle>
              <CardDescription className="text-gray-400">For enterprises and platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold mb-2">Let’s talk</div>
              <div className="text-xs text-gray-400 mb-4">Platform fee: 8.99% of donations collected (excl. Stripe fees)</div>
              <ul className="space-y-2 mb-6">
                {featuresCustom.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-gray-300"><Check className="h-4 w-4 text-green-400 mt-1" />{f}</li>
                ))}
              </ul>
              <a href="mailto:sales@eventraisehub.com">
                <Button variant="outline" className="w-full">Contact sales</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



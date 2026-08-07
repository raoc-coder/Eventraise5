'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'

type Mode = 'login' | 'register'

interface PhoneVerifyAuthProps {
  mode: Mode
}

export function PhoneVerifyAuth({ mode }: PhoneVerifyAuthProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [loading, setLoading] = useState(false)

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'register') {
      if (!fullName.trim() || !organizationName.trim()) {
        toast.error('Please enter your name and organization')
        return
      }
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.message || 'Could not send verification code')
        return
      }
      toast.success('Verification code sent')
      setStep('code')
    } catch {
      toast.error('Could not send verification code')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify/check', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code,
          ...(mode === 'register'
            ? { fullName: fullName.trim(), organizationName: organizationName.trim() }
            : {}),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        const hint =
          json.error === 'misconfigured'
            ? json.message
            : json.error === 'session_failed'
              ? json.detail || json.message || 'Sign-in succeeded but session could not be created.'
              : json.message || 'Invalid code'
        toast.error(hint)
        return
      }
      // Session lives in httpOnly cookies from the API (ADR-0018).
      toast.success(mode === 'register' ? 'Account ready!' : 'Signed in!')
      if (json.platform_admin_console_available) {
        toast('Use Admin Console sign-in for platform tools.', { icon: 'ℹ️' })
      }
      const redirectTo = localStorage.getItem('redirectAfterLogin')
      if (redirectTo) {
        localStorage.removeItem('redirectAfterLogin')
        window.location.assign(redirectTo)
      } else {
        window.location.assign('/dashboard')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'register' ? 'Create Account' : 'Welcome Back!'
  const subtitle =
    mode === 'register'
      ? 'Verify your mobile number to start managing events'
      : 'Sign in with a one-time code sent to your phone'

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-trust-600 to-trust-800 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">EventraiseHub</span>
            </div>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-gray-600">{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={sendCode} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Your organization"
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">US numbers only for now. Standard SMS rates may apply.</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send verification code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying…' : mode === 'register' ? 'Create account' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                Use a different number
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'register' ? (
                <>
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-trust-700 hover:underline">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New here?{' '}
                  <Link href="/auth/register" className="text-trust-700 hover:underline">
                    Create account
                  </Link>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

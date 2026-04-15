'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { TurnstileCaptcha } from '@/components/auth/TurnstileCaptcha'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
  const router = useRouter()
  const captchaEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!sharedSupabase) {
      console.error('Missing Supabase environment variables')
      toast.error('Authentication service is not available. Please check your configuration.')
      return
    }
    setSupabase(sharedSupabase)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      toast.error('Authentication service is not available. Please try again.')
      return
    }

    if (captchaEnabled && !captchaToken) {
      toast.error('Please complete CAPTCHA verification before signing in.')
      return
    }
    
    setLoading(true)

    try {
      console.log('[auth/login] signIn request', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaEnabled ? { captchaToken: captchaToken || undefined } : undefined,
      })

      if (error) {
        console.log('[auth/login] signIn error', { error: error.message, status: error.status })
        if (error.message?.includes('email not confirmed') || error.message?.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.')
        } else if (error.message?.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.')
        } else if (error.message?.toLowerCase().includes('captcha')) {
          if (!captchaEnabled) {
            toast.error('CAPTCHA is required but not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY.')
          } else {
            toast.error('CAPTCHA verification failed. Please try again.')
          }
          setCaptchaResetSignal((v) => v + 1)
        } else {
          toast.error(error.message || 'Login failed')
        }
      } else {
        console.log('[auth/login] signIn success', { userId: data.user?.id })
        toast.success('Login successful!')
        // Check if there's a stored redirect destination
        const redirectTo = localStorage.getItem('redirectAfterLogin')
        if (redirectTo) {
          localStorage.removeItem('redirectAfterLogin')
          router.push(redirectTo)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      console.error('[auth/login] exception:', error)
      toast.error(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                EventraiseHub
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your EventraiseHub account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <TurnstileCaptcha onTokenChange={setCaptchaToken} resetSignal={captchaResetSignal} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAuthRedirectUrl, getEmailRedirectUrl } from '@/lib/auth-config'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationName: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Only initialize Supabase client on the client side
    if (typeof window !== 'undefined') {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables')
          return
        }

        // Debug: safe env visibility in client (prefixes only)
        const redact = (v?: string) => (v ? `${v.slice(0, 8)}…(${v.length})` : 'undefined')
        console.log('[auth/register] Initializing Supabase', {
          supabaseUrl,
          supabaseAnonKeyPrefix: redact(supabaseAnonKey),
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
        })

        const client = createClient(supabaseUrl, supabaseAnonKey)
        setSupabase(client)
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error)
      }
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      toast.error('Authentication service is not available. Please try again.')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      console.log('[auth/register] signUp request', {
        email: formData.email,
        emailRedirectTo: getEmailRedirectUrl(),
      })
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            organization_name: formData.organizationName,
          },
          emailRedirectTo: getEmailRedirectUrl()
        }
      })

      console.log('[auth/register] signUp response', {
        errorMessage: error?.message,
        errorName: (error as any)?.name,
        currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server',
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created! Please check your email to verify your account before signing in.')
        router.push('/auth/login')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-soft">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-orange-500 bg-clip-text text-transparent">
                EventraiseHub
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-300">
            Start your fundraising journey today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="Enter your organization name"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-cyan-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

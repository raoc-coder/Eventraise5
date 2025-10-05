'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase as sharedSupabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function EmailConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // Initialize Supabase client
    if (typeof window !== 'undefined') {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables')
          setStatus('error')
          setMessage('Configuration error. Please contact support.')
          return
        }

        const client = sharedSupabase!
        setSupabase(client)
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error)
        setStatus('error')
        setMessage('Failed to initialize authentication service.')
      }
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const handleEmailConfirmation = async () => {
      const token_hash = searchParams?.get('token_hash') || null
      const type = searchParams?.get('type') || null
      const access_token = searchParams?.get('access_token') || null
      const refresh_token = searchParams?.get('refresh_token') || null
      const next = searchParams?.get('next') ?? '/dashboard'

      console.log('Email confirmation params:', {
        token_hash,
        type,
        access_token,
        refresh_token,
        allParams: searchParams ? Object.fromEntries(searchParams.entries()) : {}
      })

      // Handle different types of confirmation links
      if (token_hash && type) {
        // OTP-based confirmation
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            console.error('Email confirmation error:', error)
            setStatus('error')
            setMessage(error.message || 'Failed to confirm email address.')
          } else {
            setStatus('success')
            setMessage('Email confirmed successfully! You can now sign in.')
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push(next)
            }, 2000)
          }
        } catch (error) {
          console.error('Email confirmation exception:', error)
          setStatus('error')
          setMessage('An unexpected error occurred during email confirmation.')
        }
      } else if (access_token && refresh_token) {
        // Token-based confirmation
        try {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (error) {
            console.error('Session error:', error)
            setStatus('error')
            setMessage(error.message || 'Failed to confirm email address.')
          } else {
            setStatus('success')
            setMessage('Email confirmed successfully! You can now sign in.')
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push(next)
            }, 2000)
          }
        } catch (error) {
          console.error('Session exception:', error)
          setStatus('error')
          setMessage('An unexpected error occurred during email confirmation.')
        }
      } else {
        setStatus('error')
        setMessage('Invalid confirmation link. Please try again.')
        console.error('Missing required parameters:', { token_hash, type, access_token, refresh_token })
      }
    }

    handleEmailConfirmation()
  }, [supabase, searchParams, router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
          <CardTitle className="text-2xl text-white">Email Confirmation</CardTitle>
          <CardDescription className="text-gray-300">
            {status === 'loading' && 'Confirming your email address...'}
            {status === 'success' && 'Email confirmed successfully!'}
            {status === 'error' && 'Confirmation failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              <p className="text-gray-300">Please wait while we confirm your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-400" />
              <p className="text-green-400 font-medium">{message}</p>
              <p className="text-gray-300 text-sm">Redirecting to dashboard...</p>
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-400 font-medium">{message}</p>
              <div className="flex flex-col space-y-2">
                <Link href="/auth/register">
                  <Button variant="outline" className="w-full">
                    Try Again
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
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
            <CardTitle className="text-2xl text-white">Email Confirmation</CardTitle>
            <CardDescription className="text-gray-300">
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              <p className="text-gray-300">Please wait...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <EmailConfirmContent />
    </Suspense>
  )
}

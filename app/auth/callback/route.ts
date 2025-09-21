import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback params:', {
    code,
    token_hash,
    type,
    access_token,
    refresh_token,
    allParams: Object.fromEntries(searchParams.entries())
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.redirect(`${origin}/auth/login?error=configuration_error`)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Handle different types of authentication callbacks
    if (code) {
      // OAuth callback with code
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    } else if (token_hash && type) {
      // Email confirmation with token_hash
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })
      
      if (error) {
        console.error('Email confirmation error:', error)
        return NextResponse.redirect(`${origin}/auth/confirm?error=confirmation_failed`)
      }
      
      return NextResponse.redirect(`${origin}/auth/confirm?success=true`)
    } else if (access_token && refresh_token) {
      // Session-based confirmation
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })
      
      if (error) {
        console.error('Session error:', error)
        return NextResponse.redirect(`${origin}/auth/confirm?error=session_failed`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('No valid authentication parameters found')
      return NextResponse.redirect(`${origin}/auth/login?error=invalid_parameters`)
    }
  } catch (error) {
    console.error('Auth callback exception:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_exception`)
  }
}

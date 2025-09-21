import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.redirect(`${origin}/auth/login?error=configuration_error`)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
      }
      
      // Successful authentication
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_exception`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/login?error=no_code_provided`)
}

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('[api/auth/login] signIn error:', error)
      return NextResponse.json(
        { error: error.message },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com',
            'Access-Control-Allow-Credentials': 'true',
          },
        }
      )
    }

    return NextResponse.json(
      {
        user: data.user,
        session: data.session,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    )
  } catch (error: any) {
    console.error('[api/auth/login] exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://www.eventraisehub.com',
          'Access-Control-Allow-Credentials': 'true',
        },
      }
    )
  }
}


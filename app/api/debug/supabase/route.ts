import { NextResponse } from 'next/server'

export const revalidate = 0

function mask(value?: string | null) {
  if (!value) return 'undefined'
  return `${value.slice(0, 8)}…(${value.length})`
}

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'undefined',
  })
}



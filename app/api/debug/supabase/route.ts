import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth-utils'
import { NextRequest } from 'next/server'

export const revalidate = 0

function mask(value?: string | null) {
  if (!value) return 'undefined'
  return `${value.slice(0, 8)}…(${value.length})`
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await requireAdminAuth(req)

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'undefined',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'undefined',
  })
}



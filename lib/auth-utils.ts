import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export interface AuthResult {
  user: any
  db: any
  authMethod: 'cookie' | 'token' | 'none'
}

/**
 * Standardized authentication for API routes
 * Tries cookie-based auth first, falls back to token-based auth
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  let db: any
  let authMethod: 'cookie' | 'token' | 'none' = 'none'
  
  // First try cookie-based auth
  try {
    const cookieStore = cookies()
    db = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await db.auth.getUser()
    if (user) {
      authMethod = 'cookie'
      return { user, db, authMethod }
    }
  } catch (error) {
    console.log('Cookie auth failed:', error)
  }
  
  // If cookie auth failed, try token-based auth
  const authHeader = req.headers.get('authorization') || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (match) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    db = createClient(url, key, { global: { headers: { Authorization: `Bearer ${match[1]}` } } })
    const { data: { user } } = await db.auth.getUser()
    if (user) {
      authMethod = 'token'
      return { user, db, authMethod }
    }
  }
  
  // No valid authentication found
  return { user: null, db: null, authMethod }
}

/**
 * Check if user is owner or admin of an event
 */
export async function checkEventAccess(db: any, userId: string, eventId: string): Promise<{ isOwner: boolean; isAdmin: boolean; event: any }> {
  const { data: ev, error: evErr } = await db
    .from('events')
    .select('id, organizer_id, created_by, title')
    .eq('id', eventId)
    .single()
    
  if (evErr || !ev) {
    throw new Error('Event not found')
  }
  
  const isOwner = userId === (ev.organizer_id ?? ev.created_by)
  
  // Check if user is admin
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  const isAdmin = profile?.role === 'admin'
  
  return { isOwner, isAdmin, event: ev }
}

/**
 * Standardized authentication middleware for API routes
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const auth = await authenticateRequest(req)
  
  if (!auth.user) {
    throw new Error('Authentication required')
  }
  
  return auth
}

/**
 * Standardized event owner/admin check
 */
export async function requireEventAccess(req: NextRequest, eventId: string): Promise<AuthResult & { event: any }> {
  const auth = await requireAuth(req)
  
  const { isOwner, isAdmin, event } = await checkEventAccess(auth.db, auth.user.id, eventId)
  
  if (!isOwner && !isAdmin) {
    throw new Error('Forbidden')
  }
  
  return { ...auth, event }
}

/**
 * Require admin authentication
 */
export async function requireAdminAuth(req: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(req)

  // Prefer server-side admin client to avoid RLS or token edge cases
  try {
    const { supabaseAdmin } = await import('./supabase')
    if (supabaseAdmin) {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', auth.user.id)
        .single()
      if (!error && profile?.role === 'admin') {
        return auth
      }
    }
  } catch {}

  // Fallback to session-bound client
  const { data: profile, error } = await auth.db
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single()

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return auth
}

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { resolvePlatformAdminAccess } from '@/lib/platform-admin'

export interface AuthResult {
  user: any
  db: any
  authMethod: 'cookie' | 'token' | 'none'
}

function parseAllowlist(raw?: string) {
  return (raw || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function isOwnerAdminUser(user: any) {
  const ownerIds = parseAllowlist(process.env.OWNER_USER_IDS)
  const ownerEmails = parseAllowlist(process.env.OWNER_ADMIN_EMAILS)

  const userId = String(user?.id || '').toLowerCase()
  const userEmail = String(user?.email || '').toLowerCase()

  const idMatch = !!userId && ownerIds.includes(userId)
  const emailMatch = !!userEmail && ownerEmails.includes(userEmail)
  return idMatch || emailMatch
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
 * Check if user is owner of an event.
 * Platform-admin bypass is applied in requireEventAccess via the roster /
 * owner allowlist — never via profiles.role (privilege-escalation vector).
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
  
  return { isOwner, isAdmin: false, event: ev }
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
 * Standardized event owner / platform-admin check
 */
export async function requireEventAccess(req: NextRequest, eventId: string): Promise<AuthResult & { event: any }> {
  const auth = await requireAuth(req)
  
  const { isOwner, event } = await checkEventAccess(auth.db, auth.user.id, eventId)
  const platform = await resolvePlatformAdminAccess(auth.user)
  
  if (!isOwner && !platform.isPlatformAdmin) {
    throw new Error('Forbidden')
  }
  
  return { ...auth, event }
}

/**
 * Require platform admin authentication (console APIs)
 */
export async function requireAdminAuth(req: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(req)
  const access = await resolvePlatformAdminAccess(auth.user)
  if (!access.isPlatformAdmin) {
    throw new Error('Admin access required')
  }
  return auth
}

export async function requireOwnerAdmin(req: NextRequest): Promise<AuthResult> {
  return requireAdminAuth(req)
}

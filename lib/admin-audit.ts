import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

type AdminAuditPayload = {
  actorId: string
  actorEmail?: string | null
  action: string
  targetId?: string | null
  status: 'success' | 'failure'
  details?: Record<string, unknown>
}

export async function logAdminAction(req: NextRequest, payload: AdminAuditPayload) {
  const requestId = req.headers.get('x-request-id') || null
  const userAgent = req.headers.get('user-agent') || null
  const forwardedFor = req.headers.get('x-forwarded-for') || null

  const event = {
    actor_id: payload.actorId,
    actor_email: payload.actorEmail || null,
    action: payload.action,
    target_id: payload.targetId || null,
    status: payload.status,
    details: payload.details || {},
    request_id: requestId,
    user_agent: userAgent,
    ip_address: forwardedFor,
    created_at: new Date().toISOString(),
  }

  console.info('[admin-audit]', event)

  if (!supabaseAdmin) return
  try {
    await supabaseAdmin.from('admin_audit_log').insert(event as any)
  } catch {
    // Keep logging non-blocking even when table is unavailable.
  }
}

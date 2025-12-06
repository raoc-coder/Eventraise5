import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const body = await req.json().catch(() => ({}))
    const { action, registration_ids, status } = body

    if (!action || !registration_ids || !Array.isArray(registration_ids)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, id)

    if (action === 'update_status') {
      if (!status) return NextResponse.json({ error: 'Status required' }, { status: 400 })
      
      const { data, error } = await db
        .from('event_registrations')
        .update({ status })
        .in('id', registration_ids)
        .eq('event_id', id)
        .select('id')

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ updated: data?.length || 0 })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}

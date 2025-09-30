import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const publish = Boolean(body?.publish)

    // Build an authenticated client from cookie or header
    let db: any
    const cookieStore = cookies()
    try {
      db = createRouteHandlerClient({ cookies: () => cookieStore })
    } catch {
      db = null
    }

    if (!db) {
      const authHeader = req.headers.get('authorization') || ''
      const match = authHeader.match(/^Bearer\s+(.+)$/i)
      if (!match) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      db = createClient(url, key, {
        global: { headers: { Authorization: `Bearer ${match[1]}` } }
      })
    }

    // Identify user
    const { data: { user } } = await db.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    // Load event to check ownership
    let { data: ev, error: selErr } = await db.from('events').select('*').eq('id', id).single()
    if (selErr || !ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const isOwner = user.id === (ev.organizer_id ?? ev.created_by)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Attempt to update is_published; if column missing, return a helpful error
    const updatePayload: any = { is_published: publish }
    let { data, error } = await db.from('events').update(updatePayload).eq('id', id).select('*').single()
    if (error) {
      const code = (error as any).code
      if (code === '42703') {
        return NextResponse.json({
          error: 'is_published column missing',
          hint: 'Add is_published BOOLEAN to events or skip publish flow',
        }, { status: 501 })
      }
      return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 })
    }

    return NextResponse.json({ event: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}



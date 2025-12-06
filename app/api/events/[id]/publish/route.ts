import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

export async function POST(req: NextRequest, { params }: any) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const publish = Boolean(body?.publish)

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, id)

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



import { NextRequest, NextResponse } from 'next/server'
import { requireEventAccess } from '@/lib/auth-utils'

function toCsv(rows: any[]) {
  const headers = ['id','created_at','type','quantity','status','name','email','participant_name','participant_email']
  const escape = (v: any) => {
    const s = v == null ? '' : String(v)
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map(h => escape((r as any)[h])).join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params
    console.log('CSV export request for event:', id)
    if (!id) return new NextResponse('Missing id', { status: 400 })
    const { searchParams } = new URL(req.url)
    const type = (searchParams.get('type') || '').trim()
    const from = (searchParams.get('from') || '').trim()
    const to = (searchParams.get('to') || '').trim()

    // Use standardized authentication
    const { user, db, event } = await requireEventAccess(req, id)
    console.log('Authentication successful:', { userId: user.id, authMethod: 'standardized', eventId: event.id })

    let query = db
      .from('event_registrations')
      .select('id, created_at, type, quantity, status, name, email, participant_name, participant_email')
      .eq('event_id', id)

    if (type) query = query.eq('type', type)
    if (from) query = query.gte('created_at', new Date(from).toISOString())
    if (to) {
      const toDate = new Date(to)
      const toIso = isNaN(toDate.getTime()) ? new Date(to).toISOString() : new Date(toDate.getTime() + 24*60*60*1000).toISOString()
      query = query.lt('created_at', toIso)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    console.log('Registrations query result:', { data: data?.length, error })
    if (error) return new NextResponse(error.message, { status: 400 })

    const csv = toCsv(data || [])
    console.log('CSV generated, length:', csv.length)
    const filename = `registrations_${event.title?.replace(/[^a-z0-9]+/gi,'_').toLowerCase() || 'event'}_${new Date().toISOString().slice(0,10)}.csv`
    console.log('Returning CSV with filename:', filename)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (e) {
    return new NextResponse(e instanceof Error ? e.message : 'Unknown error', { status: 500 })
  }
}



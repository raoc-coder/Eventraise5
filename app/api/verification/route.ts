import { NextRequest, NextResponse } from 'next/server'

// Organizer verification: placeholder POST to request verification
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { organizer_id } = body
  if (!organizer_id) {
    return NextResponse.json({ error: 'organizer_id required' }, { status: 400 })
  }
  // Pretend we queued a verification job
  return NextResponse.json({ status: 'queued', organizer_id })
}


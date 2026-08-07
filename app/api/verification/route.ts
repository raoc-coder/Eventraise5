import { NextResponse } from 'next/server'

/** Stub retired (Sprint 8) — do not echo organizer_id. */
export async function POST() {
  return NextResponse.json(
    { error: 'gone', message: 'Verification API is not available.' },
    { status: 410 },
  )
}

import { NextResponse } from 'next/server'

/** Stub retired (Sprint 8) — do not expose placeholder AI surfaces. */
export async function POST() {
  return NextResponse.json(
    { error: 'gone', message: 'AI suggestions API is not available.' },
    { status: 410 },
  )
}

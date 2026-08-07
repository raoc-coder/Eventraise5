import { NextResponse } from 'next/server'

/** Stub retired (Sprint 8). */
export async function GET() {
  return NextResponse.json(
    { error: 'gone', message: 'Impact metrics API is not available.' },
    { status: 410 },
  )
}

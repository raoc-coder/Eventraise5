import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Braintree is no longer supported' }, { status: 410 })
}
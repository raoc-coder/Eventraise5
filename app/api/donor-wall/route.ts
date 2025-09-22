import { NextResponse } from 'next/server'

// Donor wall API stub: returns recent donors list (names optional), comments
export async function GET() {
  return NextResponse.json({
    donors: [
      { id: 'd1', name: 'Anonymous', amount: 50, comment: 'Keep it up!', ts: new Date().toISOString() },
      { id: 'd2', name: 'Taylor R.', amount: 100, comment: 'Happy to support', ts: new Date().toISOString() },
    ],
  })
}


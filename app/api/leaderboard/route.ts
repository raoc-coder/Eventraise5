import { NextResponse } from 'next/server'

export const revalidate = 60

// Leaderboard API stub: top donors and milestones
export async function GET() {
  return NextResponse.json({
    topDonors: [
      { rank: 1, name: 'Alex P.', amount: 1000 },
      { rank: 2, name: 'Jordan K.', amount: 750 },
    ],
    milestones: [
      { id: 'm1', label: 'Reached $5k', achieved: true },
      { id: 'm2', label: '100 donors', achieved: false },
    ],
  })
}


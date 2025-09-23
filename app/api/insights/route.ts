import { NextResponse } from 'next/server'

export const revalidate = 60

// Performance insights (Stripe + Supabase) placeholder
export async function GET() {
  return NextResponse.json({
    funnel: { visits: 1200, starts: 300, completes: 180, conversion: 0.15 },
    topDonors: [
      { name: 'Alex P.', count: 5, total: 1000 },
      { name: 'Jordan K.', count: 3, total: 750 },
    ],
    dropOffs: { step: 'payment_method', count: 45 },
  })
}


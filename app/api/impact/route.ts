import { NextResponse } from 'next/server'

// Placeholder API for impact metrics widgets
export async function GET() {
  // Static stubbed structure; values to be computed from real data later
  return NextResponse.json({
    allocation: { program: 0.9, operations: 0.1 },
    widgets: [
      { id: 'meals', label: 'Meals provided', unit: 'meals', valuePerDollar: 0.2 },
      { id: 'kits', label: 'Supply kits', unit: 'kits', valuePerDollar: 0.05 },
    ],
  })
}


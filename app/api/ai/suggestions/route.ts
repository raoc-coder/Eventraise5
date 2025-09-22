import { NextRequest, NextResponse } from 'next/server'

// AI suggestions placeholder: returns improved copy ideas
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { title, description } = body
  return NextResponse.json({
    suggestions: [
      {
        title: title ? `${title} — Make an Immediate Impact` : 'Make an Immediate Impact',
        description:
          description ||
          'Highlight a specific outcome and a clear call-to-action. Add a beneficiary story and a bold first sentence.',
      },
    ],
  })
}


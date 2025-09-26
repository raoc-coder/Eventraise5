import { NextRequest, NextResponse } from 'next/server'
import { generateClientToken } from '@/lib/braintree-server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientKey = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!rateLimit(`bt-token:${clientKey}`, 10)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    const customerId = body.customerId

    const clientToken = await generateClientToken(customerId)

    return NextResponse.json({ 
      clientToken,
      success: true 
    })
  } catch (error) {
    console.error('Client token generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate client token' 
    }, { status: 500 })
  }
}
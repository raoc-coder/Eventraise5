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

    console.log('Generating client token with customerId:', customerId)
    
    const clientToken = await generateClientToken(customerId)
    
    console.log('Client token generated successfully')

    return NextResponse.json({ 
      clientToken,
      success: true 
    })
  } catch (error) {
    console.error('Client token generation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate client token',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
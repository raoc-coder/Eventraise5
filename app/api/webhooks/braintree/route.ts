import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Braintree is temporarily disabled
    return NextResponse.json({ 
      error: 'Webhook system temporarily unavailable' 
    }, { status: 503 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed' 
    }, { status: 500 })
  }
}
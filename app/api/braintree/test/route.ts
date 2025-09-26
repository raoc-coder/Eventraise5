import { NextRequest, NextResponse } from 'next/server'
import { getBraintreeGateway, generateClientToken } from '@/lib/braintree-server'

export async function GET(req: NextRequest) {
  try {
    // Test Braintree configuration
    const config = {
      merchantId: !!process.env.BRAINTREE_MERCHANT_ID,
      publicKey: !!process.env.BRAINTREE_PUBLIC_KEY,
      privateKey: !!process.env.BRAINTREE_PRIVATE_KEY,
      environment: process.env.BRAINTREE_ENVIRONMENT || 'not set'
    }

    // Try to create gateway
    const gateway = await getBraintreeGateway()
    
    // Try to generate client token
    const clientToken = await generateClientToken()

    return NextResponse.json({
      success: true,
      config,
      gatewayCreated: !!gateway,
      clientTokenGenerated: !!clientToken,
      clientToken: clientToken ? 'Generated successfully' : 'Failed to generate'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        merchantId: !!process.env.BRAINTREE_MERCHANT_ID,
        publicKey: !!process.env.BRAINTREE_PUBLIC_KEY,
        privateKey: !!process.env.BRAINTREE_PRIVATE_KEY,
        environment: process.env.BRAINTREE_ENVIRONMENT || 'not set'
      }
    }, { status: 500 })
  }
}
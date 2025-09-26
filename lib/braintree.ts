// Braintree Gateway Configuration (server-side only)
export const braintreeGateway = {
  environment: process.env.BRAINTREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
}

// Client-side Braintree configuration
export const getBraintreeClient = async () => {
  if (typeof window !== 'undefined') {
    try {
      const braintree = await import('braintree-web')
      const client = await braintree.default.client.create({
        authorization: process.env.NEXT_PUBLIC_BRAINTREE_CLIENT_TOKEN!
      })
      return client
    } catch (error) {
      console.error('Failed to create Braintree client:', error)
      return null
    }
  }
  return null
}

// Server-side Braintree Gateway (for Node.js)
export const getBraintreeGateway = () => {
  const braintree = require('braintree')
  
  return new braintree.BraintreeGateway({
    environment: process.env.BRAINTREE_ENVIRONMENT === 'production' 
      ? braintree.Environment.Production 
      : braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID!,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
  })
}

// Generate client token for frontend
export const generateClientToken = async (customerId?: string) => {
  const gateway = getBraintreeGateway()
  
  try {
    const response = await gateway.clientToken.generate({
      customerId: customerId
    })
    return response.clientToken
  } catch (error) {
    console.error('Failed to generate client token:', error)
    throw error
  }
}

// Create transaction
export const createTransaction = async (amount: string, paymentMethodNonce: string, options: any = {}) => {
  const gateway = getBraintreeGateway()
  
  try {
    const result = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: paymentMethodNonce,
      options: {
        submitForSettlement: true,
        ...options
      }
    })
    
    if (result.success) {
      return {
        success: true,
        transaction: result.transaction
      }
    } else {
      return {
        success: false,
        errors: result.message
      }
    }
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}
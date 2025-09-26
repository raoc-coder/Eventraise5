// Server-side Braintree Gateway (Node.js only)
export const braintreeGateway = {
  environment: process.env.BRAINTREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  merchantId: process.env.BRAINTREE_MERCHANT_ID!,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
}

// Server-side Braintree Gateway (for Node.js)
export const getBraintreeGateway = async () => {
  // Check if Braintree environment variables are configured
  if (!process.env.BRAINTREE_MERCHANT_ID || !process.env.BRAINTREE_PUBLIC_KEY || !process.env.BRAINTREE_PRIVATE_KEY) {
    throw new Error('Braintree environment variables not configured. Please check BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, and BRAINTREE_PRIVATE_KEY.')
  }

  const braintree = await import('braintree')
  
  return new braintree.default.BraintreeGateway({
    environment: process.env.BRAINTREE_ENVIRONMENT === 'production' 
      ? braintree.default.Environment.Production 
      : braintree.default.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID!,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
  })
}

// Generate client token for frontend
export const generateClientToken = async (customerId?: string) => {
  const gateway = await getBraintreeGateway()
  
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
  const gateway = await getBraintreeGateway()
  
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
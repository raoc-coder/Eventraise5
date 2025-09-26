// Client-side Braintree configuration (browser only)
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
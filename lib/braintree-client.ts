// Client-side Braintree configuration (browser only)
export const getBraintreeClient = async (clientToken: string) => {
  if (typeof window !== 'undefined') {
    try {
      const braintree = await import('braintree-web')
      const client = await braintree.default.client.create({
        authorization: clientToken
      })
      return client
    } catch (error) {
      console.error('Failed to create Braintree client:', error)
      return null
    }
  }
  return null
}
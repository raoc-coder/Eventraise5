import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : (null as unknown as Stripe)

export const getStripe = () => {
  if (typeof window !== 'undefined') {
    return import('@stripe/stripe-js').then(({ loadStripe }) =>
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    )
  }
  return null
}

// Stripe Connect scaffolding
export type ConnectAccountType = 'standard' | 'express' | 'custom'

export const createConnectAccount = async (type: ConnectAccountType = 'express') => {
  if (!stripe) throw new Error('Stripe not configured')
  return stripe.accounts.create({ type })
}

export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
  if (!stripe) throw new Error('Stripe not configured')
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
}

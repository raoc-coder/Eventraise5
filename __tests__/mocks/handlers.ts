import { http, HttpResponse } from 'msw'
import { mockCampaign, mockEvent, mockDonation, mockUser } from '../utils/test-utils'

// Supabase API handlers
export const supabaseHandlers = [
  // Auth endpoints
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    })
  }),

  http.get('https://test.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      user: mockUser,
    })
  }),

  // Campaign endpoints
  http.get('https://test.supabase.co/rest/v1/campaigns', () => {
    return HttpResponse.json([mockCampaign])
  }),

  http.get('https://test.supabase.co/rest/v1/campaigns/:id', ({ params }) => {
    return HttpResponse.json(mockCampaign)
  }),

  http.post('https://test.supabase.co/rest/v1/campaigns', () => {
    return HttpResponse.json(mockCampaign, { status: 201 })
  }),

  http.patch('https://test.supabase.co/rest/v1/campaigns/:id', () => {
    return HttpResponse.json(mockCampaign)
  }),

  // Event endpoints
  http.get('https://test.supabase.co/rest/v1/events', () => {
    return HttpResponse.json([mockEvent])
  }),

  http.get('https://test.supabase.co/rest/v1/events/:id', ({ params }) => {
    return HttpResponse.json(mockEvent)
  }),

  http.post('https://test.supabase.co/rest/v1/events', () => {
    return HttpResponse.json(mockEvent, { status: 201 })
  }),

  // Donation endpoints
  http.get('https://test.supabase.co/rest/v1/donations', () => {
    return HttpResponse.json([mockDonation])
  }),

  http.post('https://test.supabase.co/rest/v1/donations', () => {
    return HttpResponse.json(mockDonation, { status: 201 })
  }),

  // RPC endpoints
  http.post('https://test.supabase.co/rest/v1/rpc/increment_campaign_amount', () => {
    return HttpResponse.json({ success: true })
  }),

  http.post('https://test.supabase.co/rest/v1/rpc/get_campaign_stats', () => {
    return HttpResponse.json({
      total_donations: 10,
      total_amount: 5000,
      average_donation: 500,
      last_donation: '2024-01-01T00:00:00Z',
    })
  }),
]

// Stripe API handlers
export const stripeHandlers = [
  // Create checkout session
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
      payment_intent: 'pi_test_123',
      amount_total: 10000,
      currency: 'usd',
      status: 'open',
      metadata: {
        campaign_id: 'test-campaign-id',
        donor_name: 'Test Donor',
        donor_email: 'donor@example.com',
      },
    })
  }),

  // Retrieve payment intent
  http.get('https://api.stripe.com/v1/payment_intents/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      amount: 10000,
      currency: 'usd',
      status: 'succeeded',
      metadata: {
        campaign_id: 'test-campaign-id',
        donor_name: 'Test Donor',
        donor_email: 'donor@example.com',
      },
    })
  }),

  // Webhook endpoint
  http.post('/api/webhooks/stripe', () => {
    return HttpResponse.json({ received: true })
  }),
]

// Application API handlers
export const appHandlers = [
  // Create checkout
  http.post('/api/create-checkout', () => {
    return HttpResponse.json({
      sessionId: 'cs_test_123',
      sessionUrl: 'https://checkout.stripe.com/test',
    })
  }),

  // Payment success
  http.get('/payment/success', () => {
    return HttpResponse.json({ success: true })
  }),

  // Payment cancel
  http.get('/payment/cancel', () => {
    return HttpResponse.json({ cancelled: true })
  }),
]

// Error handlers for testing error scenarios
export const errorHandlers = [
  // Supabase auth error
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 400 }
    )
  }),

  // Campaign not found
  http.get('https://test.supabase.co/rest/v1/campaigns/:id', () => {
    return HttpResponse.json(
      { error: 'Campaign not found' },
      { status: 404 }
    )
  }),

  // Stripe error
  http.post('https://api.stripe.com/v1/checkout/sessions', () => {
    return HttpResponse.json(
      { error: { message: 'Invalid amount' } },
      { status: 400 }
    )
  }),

  // App API error
  http.post('/api/create-checkout', () => {
    return HttpResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    )
  }),
]

// Network error handlers
export const networkErrorHandlers = [
  http.get('https://test.supabase.co/rest/v1/campaigns', () => {
    return HttpResponse.error()
  }),

  http.post('/api/create-checkout', () => {
    return HttpResponse.error()
  }),
]

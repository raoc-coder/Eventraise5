import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/app/providers'

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    organization_name: 'Test School',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock campaign data
export const mockCampaign = {
  id: 'test-campaign-id',
  title: 'Test Campaign',
  description: 'A test fundraising campaign',
  goal_amount: 10000,
  current_amount: 5000,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  organization_name: 'Test School',
  category: 'Education',
  is_featured: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock event data
export const mockEvent = {
  id: 'test-event-id',
  title: 'Test Event',
  description: 'A test fundraising event',
  event_type: 'walkathon',
  start_date: '2024-06-01',
  end_date: '2024-06-01',
  location: 'Test Location',
  max_participants: 100,
  current_participants: 50,
  registration_fee: 25,
  organization_id: 'test-org-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock donation data
export const mockDonation = {
  id: 'test-donation-id',
  campaign_id: 'test-campaign-id',
  profile_id: 'test-profile-id',
  amount: 100,
  donor_name: 'Test Donor',
  donor_email: 'donor@example.com',
  payment_intent_id: 'pi_test_123',
  checkout_session_id: 'cs_test_123',
  status: 'completed',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock Supabase responses
export const mockSupabaseResponse = {
  data: null,
  error: null,
}

export const mockSupabaseError = {
  data: null,
  error: {
    message: 'Test error',
    code: 'TEST_ERROR',
  },
}

// Mock Stripe responses
export const mockStripeCheckoutSession = {
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
}

export const mockStripePaymentIntent = {
  id: 'pi_test_123',
  amount: 10000,
  currency: 'usd',
  status: 'succeeded',
  metadata: {
    campaign_id: 'test-campaign-id',
    donor_name: 'Test Donor',
    donor_email: 'donor@example.com',
  },
}

// Mock API responses
export const mockApiResponse = {
  success: true,
  data: {},
  message: 'Success',
}

export const mockApiError = {
  success: false,
  error: 'Test API error',
  message: 'An error occurred',
}

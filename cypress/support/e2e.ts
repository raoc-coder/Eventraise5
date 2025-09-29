// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Stripe mocks removed (migrated to Braintree)

// Custom command for mocking Supabase
Cypress.Commands.add('mockSupabase', () => {
  cy.intercept('POST', 'https://test.supabase.co/auth/v1/token', {
    statusCode: 200,
    body: {
      access_token: 'mock-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
        },
      },
    },
  }).as('supabaseAuth')

  cy.intercept('GET', 'https://test.supabase.co/rest/v1/campaigns*', {
    statusCode: 200,
    body: [],
  }).as('supabaseCampaigns')
})

// Global test configuration
beforeEach(() => {
  // Intercept API calls
  // Replace Stripe create-checkout intercept with Braintree donation checkout if needed

  cy.intercept('GET', '/api/campaigns/*', {
    statusCode: 200,
    body: {
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
    },
  }).as('getCampaign')

  // Remove Stripe webhook intercept
})

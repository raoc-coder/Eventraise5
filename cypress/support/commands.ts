/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
      createCampaign(campaign: any): Chainable<void>
      createEvent(event: any): Chainable<void>
      mockStripe(): Chainable<void>
      mockSupabase(): Chainable<void>
    }
  }
}

// Custom command for login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/auth/login')
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/auth/login')
})

// Custom command for creating a campaign
Cypress.Commands.add('createCampaign', (campaign) => {
  cy.visit('/campaigns/create')
  cy.get('input[name="title"]').type(campaign.title)
  cy.get('textarea[name="description"]').type(campaign.description)
  cy.get('input[name="goal_amount"]').type(campaign.goal_amount.toString())
  cy.get('input[name="start_date"]').type(campaign.start_date)
  cy.get('input[name="end_date"]').type(campaign.end_date)
  cy.get('select[name="category"]').select(campaign.category)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/campaigns/')
})

// Custom command for creating an event
Cypress.Commands.add('createEvent', (event) => {
  cy.visit('/events/create')
  cy.get('input[name="title"]').type(event.title)
  cy.get('textarea[name="description"]').type(event.description)
  cy.get('select[name="event_type"]').select(event.event_type)
  cy.get('input[name="start_date"]').type(event.start_date)
  cy.get('input[name="location"]').type(event.location)
  cy.get('input[name="max_participants"]').type(event.max_participants.toString())
  cy.get('input[name="registration_fee"]').type(event.registration_fee.toString())
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/events/')
})

// Custom command for mocking Stripe
Cypress.Commands.add('mockStripe', () => {
  cy.window().then((win) => {
    win.Stripe = () => ({
      redirectToCheckout: cy.stub().resolves(),
      elements: () => ({
        create: cy.stub().returns({
          mount: cy.stub(),
          on: cy.stub(),
          confirmPayment: cy.stub().resolves(),
        }),
      }),
    })
  })
})

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

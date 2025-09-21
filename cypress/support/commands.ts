/// <reference types="cypress" />

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


/// <reference types="cypress" />

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

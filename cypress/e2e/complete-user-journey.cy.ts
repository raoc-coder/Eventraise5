describe('Complete User Journey - EventraiseHUB', () => {
  beforeEach(() => {
    // Mock external services
    cy.intercept('GET', '**/api/health', { fixture: 'health.json' }).as('healthCheck')
    cy.intercept('POST', '**/api/create-checkout', { fixture: 'checkout-session.json' }).as('createCheckout')
    cy.intercept('POST', '**/api/events/register', { fixture: 'event-registration.json' }).as('eventRegistration')
    cy.intercept('POST', '**/api/events/volunteer-signup', { fixture: 'volunteer-signup.json' }).as('volunteerSignup')
    cy.intercept('GET', '**/api/events/*/volunteer-shifts', { fixture: 'volunteer-shifts.json' }).as('volunteerShifts')
  })

  it('should complete full donation flow', () => {
    // Visit homepage
    cy.visit('/')
    cy.get('h1').should('contain', 'EventraiseHUB')
    cy.get('[data-testid="navigation"]').should('be.visible')

    // Navigate to campaigns
    cy.get('a[href="/campaigns"]').click()
    cy.url().should('include', '/campaigns')
    cy.get('h1').should('contain', 'Discover Amazing Campaigns')

    // Click on a campaign
    cy.get('[data-testid="campaign-card"]').first().click()
    cy.url().should('include', '/campaigns/')

    // Fill donation form
    cy.get('[data-testid="donation-form"]').should('be.visible')
    cy.get('input[name="amount"]').type('50')
    cy.get('input[name="donorName"]').type('John Doe')
    cy.get('input[name="donorEmail"]').type('john@example.com')
    cy.get('textarea[name="message"]').type('Great cause!')

    // Submit donation
    cy.get('button[type="submit"]').click()
    cy.wait('@createCheckout')
    
    // Should redirect to Braintree payment page
    cy.url().should('include', '/payment/braintree')
  })

  it('should complete event registration flow', () => {
    // Visit events page
    cy.visit('/events')
    cy.get('h1').should('contain', 'Discover Amazing Events')

    // Click on an event
    cy.get('[data-testid="event-card"]').first().click()
    cy.url().should('include', '/events/')

    // Fill registration form
    cy.get('[data-testid="event-registration"]').should('be.visible')
    cy.get('input[name="participantName"]').type('Jane Smith')
    cy.get('input[name="participantEmail"]').type('jane@example.com')
    cy.get('input[name="participantPhone"]').type('555-1234')
    cy.get('input[name="ticketQuantity"]').clear().type('2')
    cy.get('textarea[name="specialRequests"]').type('Vegetarian meal please')

    // Submit registration
    cy.get('button[type="submit"]').click()
    cy.wait('@eventRegistration')
    
    // Should show success message
    cy.get('[data-testid="donation-confirmation"]').should('be.visible')
    cy.get('h1').should('contain', 'Thank You')
  })

  it('should complete volunteer signup flow', () => {
    // Visit events page
    cy.visit('/events')
    cy.get('[data-testid="event-card"]').first().click()

    // Navigate to volunteer section
    cy.get('[data-testid="volunteer-shifts"]').should('be.visible')
    cy.get('button').contains('Sign Up to Volunteer').first().click()

    // Fill volunteer form
    cy.get('input[name="volunteerName"]').type('Bob Wilson')
    cy.get('input[name="volunteerEmail"]').type('bob@example.com')
    cy.get('input[name="volunteerPhone"]').type('555-5678')
    cy.get('input[name="skills"]').type('setup, decorating')
    cy.get('select[name="experienceLevel"]').select('intermediate')
    cy.get('textarea[name="availabilityNotes"]').type('Available weekends')

    // Submit volunteer signup
    cy.get('button[type="submit"]').click()
    cy.wait('@volunteerSignup')
    
    // Should show success message
    cy.get('h2').should('contain', 'Volunteer Signup Confirmed')
  })

  it('should handle admin reports and analytics', () => {
    // Visit admin reports (assuming admin user)
    cy.visit('/admin/reports')
    cy.get('h1').should('contain', 'Admin Reports & Analytics')

    // Check analytics dashboard
    cy.get('[data-testid="analytics-dashboard"]').should('be.visible')
    cy.get('h2').should('contain', 'Total Revenue')
    cy.get('h2').should('contain', 'Total Donations')
    cy.get('h2').should('contain', 'Event Registrations')
    cy.get('h2').should('contain', 'Volunteers')

    // Test export functionality
    cy.get('button').contains('Donations').click()
    cy.get('button').contains('Registrations').click()
    cy.get('button').contains('Volunteers').click()
    cy.get('button').contains('Analytics').click()

    // Test filters
    cy.get('input[name="startDate"]').type('2024-01-01')
    cy.get('input[name="endDate"]').type('2024-12-31')
    cy.get('button').contains('Refresh').click()
  })

  it('should be responsive on mobile devices', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    cy.visit('/')

    // Check navigation
    cy.get('[data-testid="navigation"]').should('be.visible')
    cy.get('button').contains('Menu').should('be.visible')

    // Test campaign card on mobile
    cy.visit('/campaigns')
    cy.get('[data-testid="campaign-card"]').should('be.visible')
    cy.get('[data-testid="campaign-card"]').first().click()

    // Test donation form on mobile
    cy.get('[data-testid="donation-form"]').should('be.visible')
    cy.get('input[name="amount"]').should('be.visible')
    cy.get('input[name="donorName"]').should('be.visible')
    cy.get('input[name="donorEmail"]').should('be.visible')

    // Test tablet viewport
    cy.viewport('ipad-2')
    cy.visit('/events')
    cy.get('[data-testid="event-card"]').should('be.visible')
  })

  it('should handle accessibility requirements', () => {
    cy.visit('/')

    // Check for proper heading hierarchy
    cy.get('h1').should('exist')
    cy.get('h2').should('exist')

    // Check for alt text on images
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt')
    })

    // Check for proper form labels
    cy.visit('/campaigns')
    cy.get('[data-testid="campaign-card"]').first().click()
    cy.get('label').should('exist')
    cy.get('input').each(($input) => {
      const id = $input.attr('id')
      if (id) {
        cy.get(`label[for="${id}"]`).should('exist')
      }
    })

    // Check for proper button text
    cy.get('button').each(($button) => {
      cy.wrap($button).should('not.be.empty')
    })

    // Check for proper link text
    cy.get('a').each(($link) => {
      cy.wrap($link).should('not.be.empty')
    })

    // Test keyboard navigation
    cy.get('body').tab()
    cy.focused().should('exist')
  })

  it('should handle error states gracefully', () => {
    // Test network error handling
    cy.intercept('GET', '**/api/health', { statusCode: 500 }).as('healthError')
    cy.visit('/')
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible')

    // Test form validation
    cy.visit('/campaigns')
    cy.get('[data-testid="campaign-card"]').first().click()
    
    // Submit empty form
    cy.get('button[type="submit"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')

    // Test invalid email
    cy.get('input[name="donorEmail"]').type('invalid-email')
    cy.get('button[type="submit"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'valid email')
  })

  it('should maintain state across page navigation', () => {
    // Visit homepage
    cy.visit('/')
    cy.get('h1').should('contain', 'EventraiseHUB')

    // Navigate to campaigns
    cy.get('a[href="/campaigns"]').click()
    cy.url().should('include', '/campaigns')

    // Navigate back to homepage
    cy.get('a[href="/"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')

    // Navigate to events
    cy.get('a[href="/events"]').click()
    cy.url().should('include', '/events')

    // Check that navigation is consistent
    cy.get('[data-testid="navigation"]').should('be.visible')
  })

  it('should handle loading states properly', () => {
    // Mock slow API responses
    cy.intercept('GET', '**/api/health', (req) => {
      req.reply((res) => {
        res.delay(1000)
        res.send({ status: 'ok' })
      })
    }).as('slowHealth')

    cy.visit('/')
    
    // Should show loading state
    cy.get('[data-testid="loading"]').should('be.visible')
    
    // Should eventually load
    cy.wait('@slowHealth')
    cy.get('[data-testid="loading"]').should('not.exist')
  })
})

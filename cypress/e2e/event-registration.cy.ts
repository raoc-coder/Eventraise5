describe('Event Registration Flow', () => {
  beforeEach(() => {
    cy.mockSupabase()
    cy.visit('/events/test-event-id')
  })

  it('displays event information correctly', () => {
    cy.get('[data-testid="event-title"]').should('contain', 'Test Event')
    cy.get('[data-testid="event-description"]').should('be.visible')
    cy.get('[data-testid="event-date"]').should('contain', 'June 1, 2024')
    cy.get('[data-testid="event-location"]').should('contain', 'Test Location')
    cy.get('[data-testid="registration-fee"]').should('contain', '$25')
    cy.get('[data-testid="participant-count"]').should('contain', '50 / 100')
  })

  it('completes event registration flow', () => {
    // Fill registration form
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    cy.get('input[placeholder="Phone Number"]').type('555-1234')
    cy.get('input[placeholder="Emergency Contact"]').type('Jane Doe')
    cy.get('input[placeholder="Emergency Phone"]').type('555-5678')
    
    // Select t-shirt size
    cy.get('select[name="tshirt_size"]').select('Large')
    
    // Agree to terms
    cy.get('input[type="checkbox"][name="terms"]').check()
    
    // Submit registration
    cy.get('button[type="submit"]').contains('Register for Event').click()
    
    // Should redirect to payment
    cy.url().should('include', '/payment')
  })

  it('validates required fields', () => {
    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click()
    
    // Should show validation errors
    cy.get('[data-testid="error-message"]').should('contain', 'Please fill in all required fields')
  })

  it('validates email format', () => {
    // Fill form with invalid email
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('invalid-email')
    cy.get('input[placeholder="Phone Number"]').type('555-1234')
    
    cy.get('button[type="submit"]').click()
    
    // Should show email validation error
    cy.get('[data-testid="error-message"]').should('contain', 'Please enter a valid email')
  })

  it('validates phone number format', () => {
    // Fill form with invalid phone
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    cy.get('input[placeholder="Phone Number"]').type('invalid-phone')
    
    cy.get('button[type="submit"]').click()
    
    // Should show phone validation error
    cy.get('[data-testid="error-message"]').should('contain', 'Please enter a valid phone number')
  })

  it('requires terms agreement', () => {
    // Fill form without agreeing to terms
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    cy.get('input[placeholder="Phone Number"]').type('555-1234')
    
    cy.get('button[type="submit"]').click()
    
    // Should show terms validation error
    cy.get('[data-testid="error-message"]').should('contain', 'Please agree to the terms and conditions')
  })

  it('shows loading state during submission', () => {
    // Intercept with delay
    cy.intercept('POST', '/api/events/*/register', {
      statusCode: 200,
      body: { success: true },
      delay: 1000,
    }).as('registerEvent')
    
    // Fill form
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    cy.get('input[placeholder="Phone Number"]').type('555-1234')
    cy.get('input[type="checkbox"][name="terms"]').check()
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Should show loading state
    cy.get('button[type="submit"]').should('contain', 'Processing...')
    cy.get('button[type="submit"]').should('be.disabled')
  })

  it('handles registration errors gracefully', () => {
    // Intercept with error response
    cy.intercept('POST', '/api/events/*/register', {
      statusCode: 400,
      body: { error: 'Event is full' },
    }).as('registerEventError')
    
    // Fill form
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    cy.get('input[placeholder="Phone Number"]').type('555-1234')
    cy.get('input[type="checkbox"][name="terms"]').check()
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('contain', 'Event is full')
  })

  it('displays participant count correctly', () => {
    cy.get('[data-testid="participant-count"]').should('contain', '50 / 100')
    cy.get('[data-testid="spots-remaining"]').should('contain', '50 spots remaining')
  })

  it('shows event details in sidebar', () => {
    cy.get('[data-testid="event-details"]').within(() => {
      cy.get('[data-testid="event-date"]').should('contain', 'June 1, 2024')
      cy.get('[data-testid="event-time"]').should('contain', '9:00 AM - 5:00 PM')
      cy.get('[data-testid="event-location"]').should('contain', 'Test Location')
      cy.get('[data-testid="event-type"]').should('contain', 'Walkathon')
    })
  })

  it('allows viewing event details before registration', () => {
    // Click on event details
    cy.get('[data-testid="view-details"]').click()
    
    // Should show detailed information
    cy.get('[data-testid="event-description"]').should('be.visible')
    cy.get('[data-testid="event-rules"]').should('be.visible')
    cy.get('[data-testid="event-what-to-bring"]').should('be.visible')
  })
})

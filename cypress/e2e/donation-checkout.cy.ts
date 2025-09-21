describe('Donation Checkout Flow', () => {
  beforeEach(() => {
    cy.mockStripe()
    cy.mockSupabase()
    cy.visit('/campaigns/test-campaign-id')
  })

  it('completes donation flow with preset amount', () => {
    // Wait for campaign to load
    cy.get('[data-testid="campaign-title"]').should('contain', 'Test Campaign')
    
    // Select preset amount
    cy.get('[data-testid="preset-amount-100"]').click()
    
    // Fill in donor information
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    
    // Submit donation
    cy.get('button[type="submit"]').contains('Donate $100').click()
    
    // Should create checkout session
    cy.wait('@createCheckout').then((interception) => {
      expect(interception.request.body).to.include({
        amount: 100,
        campaign_id: 'test-campaign-id',
        donor_name: 'John Doe',
        donor_email: 'john@example.com',
      })
    })
    
    // Should redirect to Stripe checkout
    cy.url().should('include', 'checkout.stripe.com')
  })

  it('completes donation flow with custom amount', () => {
    // Wait for campaign to load
    cy.get('[data-testid="campaign-title"]').should('contain', 'Test Campaign')
    
    // Enter custom amount
    cy.get('input[placeholder="Enter custom amount"]').type('250')
    
    // Fill in donor information
    cy.get('input[placeholder="Your Full Name"]').type('Jane Smith')
    cy.get('input[placeholder="Enter your email"]').type('jane@example.com')
    
    // Submit donation
    cy.get('button[type="submit"]').contains('Donate $250').click()
    
    // Should create checkout session
    cy.wait('@createCheckout').then((interception) => {
      expect(interception.request.body).to.include({
        amount: 250,
        campaign_id: 'test-campaign-id',
        donor_name: 'Jane Smith',
        donor_email: 'jane@example.com',
      })
    })
  })

  it('validates required fields', () => {
    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click()
    
    // Should show validation errors
    cy.get('[data-testid="error-message"]').should('contain', 'Please enter a valid donation amount')
  })

  it('validates email format', () => {
    // Enter invalid email
    cy.get('input[placeholder="Enter custom amount"]').type('50')
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('invalid-email')
    
    cy.get('button[type="submit"]').click()
    
    // Should show email validation error
    cy.get('[data-testid="error-message"]').should('contain', 'Please enter your email')
  })

  it('shows loading state during submission', () => {
    // Intercept with delay to test loading state
    cy.intercept('POST', '/api/create-checkout', {
      statusCode: 200,
      body: {
        sessionId: 'cs_test_123',
        sessionUrl: 'https://checkout.stripe.com/test',
      },
      delay: 1000,
    }).as('createCheckoutDelayed')
    
    // Fill form
    cy.get('input[placeholder="Enter custom amount"]').type('100')
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Should show loading state
    cy.get('button[type="submit"]').should('contain', 'Processing...')
    cy.get('button[type="submit"]').should('be.disabled')
  })

  it('handles API errors gracefully', () => {
    // Intercept with error response
    cy.intercept('POST', '/api/create-checkout', {
      statusCode: 500,
      body: { error: 'Database not configured' },
    }).as('createCheckoutError')
    
    // Fill form
    cy.get('input[placeholder="Enter custom amount"]').type('100')
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('contain', 'Database not configured')
  })

  it('displays campaign progress correctly', () => {
    // Check progress bar
    cy.get('[data-testid="progress-bar"]').should('be.visible')
    cy.get('[data-testid="progress-percentage"]').should('contain', '50%')
    cy.get('[data-testid="raised-amount"]').should('contain', '$5,000')
    cy.get('[data-testid="goal-amount"]').should('contain', '$10,000')
  })

  it('allows amount selection via preset buttons', () => {
    // Test all preset amounts
    const amounts = [25, 50, 100, 250, 500]
    
    amounts.forEach((amount) => {
      cy.get(`[data-testid="preset-amount-${amount}"]`).click()
      cy.get('input[placeholder="Enter custom amount"]').should('have.value', amount.toString())
    })
  })

  it('prevents invalid amount input', () => {
    // Try to enter non-numeric value
    cy.get('input[placeholder="Enter custom amount"]').type('abc')
    cy.get('input[placeholder="Enter custom amount"]').should('have.value', '')
    
    // Try to enter negative value
    cy.get('input[placeholder="Enter custom amount"]').type('-50')
    cy.get('input[placeholder="Enter custom amount"]').should('have.value', '50')
  })
})

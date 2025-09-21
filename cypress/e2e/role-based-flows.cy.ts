describe('Role-Based User Flows', () => {
  describe('Parent Role', () => {
    beforeEach(() => {
      cy.mockSupabase()
      cy.login('parent@example.com', 'password123')
    })

    it('can view and register for events', () => {
      cy.visit('/events')
      cy.get('[data-testid="event-card"]').first().click()
      cy.get('[data-testid="register-button"]').click()
      
      // Should be able to register
      cy.get('input[placeholder="Your Full Name"]').type('Parent Name')
      cy.get('input[placeholder="Enter your email"]').type('parent@example.com')
      cy.get('input[placeholder="Phone Number"]').type('555-1234')
      cy.get('input[type="checkbox"][name="terms"]').check()
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/payment')
    })

    it('can make donations to campaigns', () => {
      cy.visit('/campaigns/test-campaign-id')
      cy.get('input[placeholder="Enter custom amount"]').type('100')
      cy.get('input[placeholder="Your Full Name"]').type('Parent Name')
      cy.get('input[placeholder="Enter your email"]').type('parent@example.com')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', 'checkout.stripe.com')
    })

    it('can view their dashboard', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-title"]').should('contain', 'Your Dashboard')
      cy.get('[data-testid="recent-donations"]').should('be.visible')
      cy.get('[data-testid="registered-events"]').should('be.visible')
    })

    it('cannot access admin features', () => {
      cy.visit('/admin/reports')
      cy.url().should('not.include', '/admin')
      cy.get('[data-testid="access-denied"]').should('be.visible')
    })
  })

  describe('Teacher Role', () => {
    beforeEach(() => {
      cy.mockSupabase()
      cy.login('teacher@example.com', 'password123')
    })

    it('can create and manage events', () => {
      cy.visit('/events/create')
      cy.get('input[name="title"]').type('School Fundraiser')
      cy.get('textarea[name="description"]').type('Annual school fundraiser event')
      cy.get('select[name="event_type"]').select('walkathon')
      cy.get('input[name="start_date"]').type('2024-06-01')
      cy.get('input[name="location"]').type('School Gym')
      cy.get('input[name="max_participants"]').type('200')
      cy.get('input[name="registration_fee"]').type('25')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/events/')
      cy.get('[data-testid="event-created"]').should('be.visible')
    })

    it('can create and manage campaigns', () => {
      cy.visit('/campaigns/create')
      cy.get('input[name="title"]').type('Library Books Campaign')
      cy.get('textarea[name="description"]').type('Help us buy new books for the library')
      cy.get('input[name="goal_amount"]').type('5000')
      cy.get('input[name="start_date"]').type('2024-01-01')
      cy.get('input[name="end_date"]').type('2024-12-31')
      cy.get('select[name="category"]').select('Education')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/campaigns/')
      cy.get('[data-testid="campaign-created"]').should('be.visible')
    })

    it('can view event participants', () => {
      cy.visit('/events/test-event-id')
      cy.get('[data-testid="view-participants"]').click()
      cy.get('[data-testid="participants-list"]').should('be.visible')
      cy.get('[data-testid="participant-count"]').should('contain', '50 participants')
    })

    it('can view campaign donations', () => {
      cy.visit('/campaigns/test-campaign-id')
      cy.get('[data-testid="view-donations"]').click()
      cy.get('[data-testid="donations-list"]').should('be.visible')
      cy.get('[data-testid="total-raised"]').should('contain', '$5,000')
    })

    it('cannot access admin reports', () => {
      cy.visit('/admin/reports')
      cy.url().should('not.include', '/admin')
      cy.get('[data-testid="access-denied"]').should('be.visible')
    })
  })

  describe('Admin Role', () => {
    beforeEach(() => {
      cy.mockSupabase()
      cy.login('admin@example.com', 'password123')
    })

    it('can access admin dashboard', () => {
      cy.visit('/admin/dashboard')
      cy.get('[data-testid="admin-dashboard"]').should('be.visible')
      cy.get('[data-testid="system-stats"]').should('be.visible')
      cy.get('[data-testid="recent-activity"]').should('be.visible')
    })

    it('can view system reports', () => {
      cy.visit('/admin/reports')
      cy.get('[data-testid="reports-title"]').should('contain', 'System Reports')
      cy.get('[data-testid="financial-summary"]').should('be.visible')
      cy.get('[data-testid="user-activity"]').should('be.visible')
      cy.get('[data-testid="campaign-performance"]').should('be.visible')
    })

    it('can manage users', () => {
      cy.visit('/admin/users')
      cy.get('[data-testid="users-table"]').should('be.visible')
      cy.get('[data-testid="user-actions"]').should('be.visible')
    })

    it('can manage organizations', () => {
      cy.visit('/admin/organizations')
      cy.get('[data-testid="organizations-table"]').should('be.visible')
      cy.get('[data-testid="organization-actions"]').should('be.visible')
    })

    it('can view all campaigns and events', () => {
      cy.visit('/admin/campaigns')
      cy.get('[data-testid="all-campaigns"]').should('be.visible')
      
      cy.visit('/admin/events')
      cy.get('[data-testid="all-events"]').should('be.visible')
    })

    it('can export data', () => {
      cy.visit('/admin/reports')
      cy.get('[data-testid="export-button"]').click()
      cy.get('[data-testid="export-options"]').should('be.visible')
    })
  })

  describe('Unauthenticated User', () => {
    it('can view public events and campaigns', () => {
      cy.visit('/events')
      cy.get('[data-testid="event-card"]').should('be.visible')
      
      cy.visit('/campaigns')
      cy.get('[data-testid="campaign-card"]').should('be.visible')
    })

    it('cannot access protected routes', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/auth/login')
      
      cy.visit('/events/create')
      cy.url().should('include', '/auth/login')
      
      cy.visit('/admin/dashboard')
      cy.url().should('include', '/auth/login')
    })

    it('can register for events without login', () => {
      cy.visit('/events/test-event-id')
      cy.get('[data-testid="register-button"]').click()
      
      // Should show registration form
      cy.get('input[placeholder="Your Full Name"]').should('be.visible')
      cy.get('input[placeholder="Enter your email"]').should('be.visible')
    })

    it('can make donations without login', () => {
      cy.visit('/campaigns/test-campaign-id')
      cy.get('input[placeholder="Enter custom amount"]').type('50')
      cy.get('input[placeholder="Your Full Name"]').type('Anonymous Donor')
      cy.get('input[placeholder="Enter your email"]').type('donor@example.com')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', 'checkout.stripe.com')
    })
  })

  describe('Role Transitions', () => {
    it('handles role changes gracefully', () => {
      // Login as parent
      cy.login('parent@example.com', 'password123')
      cy.visit('/dashboard')
      cy.get('[data-testid="parent-dashboard"]').should('be.visible')
      
      // Simulate role change to teacher
      cy.window().then((win) => {
        win.localStorage.setItem('user-role', 'teacher')
      })
      
      cy.reload()
      cy.get('[data-testid="teacher-dashboard"]').should('be.visible')
    })

    it('redirects appropriately based on role', () => {
      // Login as teacher
      cy.login('teacher@example.com', 'password123')
      cy.visit('/')
      
      // Should redirect to teacher dashboard
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="teacher-dashboard"]').should('be.visible')
    })
  })
})

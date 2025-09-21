# 🧪 Testing Guide for Event Raise

This document outlines the comprehensive testing strategy for the Event Raise platform, including unit tests, integration tests, and end-to-end tests.

## 📋 Testing Overview

### Test Types
- **Unit Tests**: Component and hook testing with Jest + React Testing Library
- **Integration Tests**: API and payment flow testing with MSW (Mock Service Worker)
- **E2E Tests**: Full user journey testing with Cypress

### Coverage Goals
- **Unit Tests**: 70%+ coverage for components and utilities
- **Integration Tests**: 80%+ coverage for API flows
- **E2E Tests**: Critical user paths and role-based flows

## 🛠️ Setup and Configuration

### Prerequisites
```bash
npm install
```

### Test Scripts
```bash
# Run all tests
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode for development
npm run test:watch

# CI mode (no watch, with coverage)
npm run test:ci
```

## 🧩 Unit Testing

### Framework
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation

### Test Structure
```
__tests__/
├── components/
│   ├── ui/
│   │   ├── button.test.tsx
│   │   ├── input.test.tsx
│   │   └── card.test.tsx
│   └── payments/
│       └── donation-form.test.tsx
├── utils/
│   └── test-utils.tsx
└── mocks/
    ├── handlers.ts
    └── server.ts
```

### Writing Unit Tests

#### Component Testing
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react'
import { useStripeCheckout } from '@/hooks/use-stripe-checkout'

describe('useStripeCheckout', () => {
  it('initiates checkout session', async () => {
    const { result } = renderHook(() => useStripeCheckout())
    
    await act(async () => {
      await result.current.initiateCheckout(100, 'campaign-id')
    })
    
    expect(result.current.loading).toBe(false)
  })
})
```

### Mocking Strategy
- **Supabase**: Mocked with jest.mock()
- **Stripe**: Mocked with jest.mock()
- **Next.js Router**: Mocked in jest.setup.js
- **Environment Variables**: Set in test configuration

## 🔗 Integration Testing

### Framework
- **MSW (Mock Service Worker)**: API mocking
- **Jest**: Test runner
- **React Testing Library**: Component testing

### Test Structure
```
__tests__/
├── integration/
│   ├── payment-flow.test.tsx
│   ├── auth-flow.test.tsx
│   └── campaign-management.test.tsx
└── mocks/
    ├── handlers.ts
    └── server.ts
```

### Writing Integration Tests

#### API Flow Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { server } from '../mocks/server'
import { rest } from 'msw'
import { DonationForm } from '@/components/payments/donation-form'

describe('Payment Flow Integration', () => {
  it('completes successful donation flow', async () => {
    // Mock API response
    server.use(
      rest.post('/api/create-checkout', (req, res, ctx) => {
        return res(ctx.json({
          sessionId: 'cs_test_123',
          sessionUrl: 'https://checkout.stripe.com/test',
        }))
      })
    )

    render(<DonationForm {...props} />)
    
    // Test user interaction
    await user.type(screen.getByPlaceholderText('Enter custom amount'), '100')
    await user.click(screen.getByRole('button', { name: /donate/i }))
    
    // Verify API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
          amount: 100,
          campaign_id: 'test-campaign-id',
        }),
      })
    })
  })
})
```

### Mock Handlers
- **Supabase API**: Auth, campaigns, events, donations
- **Stripe API**: Checkout sessions, payment intents
- **Application API**: Custom endpoints

## 🎭 End-to-End Testing

### Framework
- **Cypress**: E2E test runner
- **Custom Commands**: Reusable test utilities
- **Mock Services**: Stripe and Supabase mocking

### Test Structure
```
cypress/
├── e2e/
│   ├── donation-checkout.cy.ts
│   ├── event-registration.cy.ts
│   └── role-based-flows.cy.ts
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── fixtures/
    └── test-data.json
```

### Writing E2E Tests

#### User Journey Testing
```typescript
describe('Donation Checkout Flow', () => {
  beforeEach(() => {
    cy.mockStripe()
    cy.mockSupabase()
    cy.visit('/campaigns/test-campaign-id')
  })

  it('completes donation flow with preset amount', () => {
    // Select preset amount
    cy.get('[data-testid="preset-amount-100"]').click()
    
    // Fill in donor information
    cy.get('input[placeholder="Your Full Name"]').type('John Doe')
    cy.get('input[placeholder="Enter your email"]').type('john@example.com')
    
    // Submit donation
    cy.get('button[type="submit"]').contains('Donate $100').click()
    
    // Verify redirect to Stripe
    cy.url().should('include', 'checkout.stripe.com')
  })
})
```

#### Role-Based Testing
```typescript
describe('Role-Based User Flows', () => {
  describe('Parent Role', () => {
    beforeEach(() => {
      cy.login('parent@example.com', 'password123')
    })

    it('can view and register for events', () => {
      cy.visit('/events')
      cy.get('[data-testid="event-card"]').first().click()
      cy.get('[data-testid="register-button"]').click()
      
      // Should be able to register
      cy.get('input[placeholder="Your Full Name"]').type('Parent Name')
      cy.get('button[type="submit"]').click()
      
      cy.url().should('include', '/payment')
    })
  })
})
```

### Custom Commands
- `cy.login()`: Authenticate user
- `cy.logout()`: Sign out user
- `cy.createCampaign()`: Create test campaign
- `cy.createEvent()`: Create test event
- `cy.mockStripe()`: Mock Stripe services
- `cy.mockSupabase()`: Mock Supabase services

## 🚀 CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit
      - uses: codecov/codecov-action@v3
```

### Test Execution
1. **Unit Tests**: Run on every commit
2. **Integration Tests**: Run on PR creation
3. **E2E Tests**: Run on main branch
4. **Coverage Reports**: Uploaded to Codecov

## 📊 Coverage and Metrics

### Coverage Thresholds
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Test Metrics
- **Unit Test Coverage**: 70%+ required
- **Integration Test Coverage**: 80%+ required
- **E2E Test Coverage**: Critical paths only
- **Performance**: < 5s for unit tests, < 30s for E2E

## 🐛 Debugging Tests

### Unit Test Debugging
```bash
# Run specific test file
npm run test -- button.test.tsx

# Run with verbose output
npm run test -- --verbose

# Run in watch mode
npm run test:watch
```

### E2E Test Debugging
```bash
# Open Cypress UI
npm run test:e2e:open

# Run specific test
npx cypress run --spec "cypress/e2e/donation-checkout.cy.ts"

# Run with video recording
npx cypress run --record
```

### Common Issues
1. **Async Operations**: Use `waitFor()` for API calls
2. **Mocking**: Ensure mocks are properly configured
3. **Timing**: Add appropriate delays for animations
4. **Environment**: Check test environment variables

## 📝 Best Practices

### Test Writing
1. **Arrange-Act-Assert**: Clear test structure
2. **Descriptive Names**: Test names should explain what they test
3. **Single Responsibility**: One test per behavior
4. **Mock External Dependencies**: Don't test third-party services
5. **Clean Up**: Reset state between tests

### Test Organization
1. **Group Related Tests**: Use `describe` blocks
2. **Setup and Teardown**: Use `beforeEach` and `afterEach`
3. **Shared Utilities**: Create reusable test helpers
4. **Mock Data**: Use consistent test data

### Performance
1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Run only changed tests in development
3. **Mock Heavy Operations**: Don't test actual API calls in unit tests
4. **Optimize E2E**: Use data-testid attributes for reliable selectors

## 🔧 Troubleshooting

### Common Problems
1. **Test Timeouts**: Increase timeout for slow operations
2. **Mock Failures**: Check mock configuration
3. **Environment Issues**: Verify environment variables
4. **Cypress Issues**: Clear browser cache and restart

### Debug Commands
```bash
# Debug Jest tests
npm run test -- --debug

# Debug Cypress tests
npx cypress open --browser chrome

# Check test coverage
npm run test:unit -- --coverage
```

## 📚 Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [MSW Documentation](https://mswjs.io/docs/)

### Examples
- See `__tests__/components/` for unit test examples
- See `__tests__/integration/` for integration test examples
- See `cypress/e2e/` for E2E test examples

This testing strategy ensures the Event Raise platform is reliable, maintainable, and user-friendly across all user roles and critical workflows.

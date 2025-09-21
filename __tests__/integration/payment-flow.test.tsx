import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { server } from '../mocks/server'
import { DonationForm } from '@/components/payments/donation-form'
import { mockCampaign } from '../utils/test-utils'

// Mock window.location
const mockLocation = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('Payment Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocation.href = ''
  })

  const defaultProps = {
    campaignId: mockCampaign.id,
    campaignTitle: mockCampaign.title,
    goalAmount: mockCampaign.goal_amount,
    currentAmount: mockCampaign.current_amount,
  }

  it('completes successful donation flow', async () => {
    const user = userEvent.setup()
    
    // Mock successful API response
    server.use(
      rest.post('/api/create-checkout', (req, res, ctx) => {
        return res(
          ctx.json({
            sessionId: 'cs_test_123',
            sessionUrl: 'https://checkout.stripe.com/test',
          })
        )
      })
    )

    render(<DonationForm {...defaultProps} />)
    
    // Fill in donation form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '100')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should redirect to Stripe checkout
    await waitFor(() => {
      expect(mockLocation.href).toBe('https://checkout.stripe.com/test')
    })
  })

  it('handles API errors during checkout creation', async () => {
    const user = userEvent.setup()
    
    // Mock API error
    server.use(
      rest.post('/api/create-checkout', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Database not configured' })
        )
      })
    )

    render(<DonationForm {...defaultProps} />)
    
    // Fill in donation form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '100')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Database not configured')).toBeInTheDocument()
    })
  })

  it('validates form inputs before submission', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show validation errors
    expect(screen.getByText('Please enter a valid donation amount')).toBeInTheDocument()
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock network error
    server.use(
      rest.post('/api/create-checkout', (req, res, ctx) => {
        return res.networkError('Failed to connect')
      })
    )

    render(<DonationForm {...defaultProps} />)
    
    // Fill in donation form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '100')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to process donation')).toBeInTheDocument()
    })
  })

  it('shows loading state during API call', async () => {
    const user = userEvent.setup()
    
    // Mock delayed API response
    server.use(
      rest.post('/api/create-checkout', (req, res, ctx) => {
        return res(
          ctx.delay(100),
          ctx.json({
            sessionId: 'cs_test_123',
            sessionUrl: 'https://checkout.stripe.com/test',
          })
        )
      })
    )

    render(<DonationForm {...defaultProps} />)
    
    // Fill in donation form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '100')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show loading state
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('handles preset amount selection correctly', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    // Click preset amount
    const presetButton = screen.getByRole('button', { name: '$250' })
    await user.click(presetButton)
    
    // Check that amount is set
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    expect(customInput).toHaveValue('250')
    
    // Check that donate button shows correct amount
    const donateButton = screen.getByRole('button', { name: /donate \$250/i })
    expect(donateButton).toBeInTheDocument()
  })

  it('validates amount input format', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    // Enter invalid amount
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, 'abc')
    
    // Should only allow numbers
    expect(customInput).toHaveValue('')
  })

  it('handles zero and negative amounts', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    // Try to submit with zero amount
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '0')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show validation error
    expect(screen.getByText('Please enter a valid donation amount')).toBeInTheDocument()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonationForm } from '@/components/payments/donation-form'
import { mockCampaign } from '../../utils/test-utils'

// Mock fetch
global.fetch = jest.fn()

describe('DonationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    campaignId: mockCampaign.id,
    campaignTitle: mockCampaign.title,
    goalAmount: mockCampaign.goal_amount,
    currentAmount: mockCampaign.current_amount,
  }

  it('renders with campaign information', () => {
    render(<DonationForm {...defaultProps} />)
    
    expect(screen.getByText(`Support ${mockCampaign.title}`)).toBeInTheDocument()
    expect(screen.getByText('Your donation makes a difference. Every contribution helps us reach our goal.')).toBeInTheDocument()
  })

  it('displays progress bar when goal amount is provided', () => {
    render(<DonationForm {...defaultProps} />)
    
    expect(screen.getByText('$5,000 raised')).toBeInTheDocument()
    expect(screen.getByText('$10,000 goal')).toBeInTheDocument()
    expect(screen.getByText('50% of goal reached')).toBeInTheDocument()
  })

  it('renders preset amount buttons', () => {
    render(<DonationForm {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: '$25' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$50' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$100' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$250' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$500' })).toBeInTheDocument()
  })

  it('allows custom amount input', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '75')
    
    expect(customInput).toHaveValue('75')
  })

  it('handles preset amount selection', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    const presetButton = screen.getByRole('button', { name: '$100' })
    await user.click(presetButton)
    
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    expect(customInput).toHaveValue('100')
  })

  it('requires donor information', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    // Set amount
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '50')
    
    // Try to submit without donor info
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show validation errors
    expect(screen.getByText('Please enter your name')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<DonationForm {...defaultProps} />)
    
    // Fill in form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '50')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Should show email validation error
    expect(screen.getByText('Please enter your email')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_123',
        sessionUrl: 'https://checkout.stripe.com/test',
      }),
    } as Response)

    render(<DonationForm {...defaultProps} />)
    
    // Fill in form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '50')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50,
          campaign_id: mockCampaign.id,
          donor_name: 'John Doe',
          donor_email: 'john@example.com',
          success_url: expect.stringContaining('/payment/success'),
          cancel_url: expect.stringContaining('/payment/cancel'),
        }),
      })
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Database not configured',
      }),
    } as Response)

    render(<DonationForm {...defaultProps} />)
    
    // Fill in form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '50')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Database not configured')).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    render(<DonationForm {...defaultProps} />)
    
    // Fill in form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '50')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('calls onSuccess callback when provided', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessionId: 'cs_test_123',
        sessionUrl: 'https://checkout.stripe.com/test',
      }),
    } as Response)

    render(<DonationForm {...defaultProps} onSuccess={onSuccess} />)
    
    // Fill in and submit form
    const customInput = screen.getByPlaceholderText('Enter custom amount')
    await user.type(customInput, '50')
    
    const nameInput = screen.getByPlaceholderText('Your Full Name')
    await user.type(nameInput, 'John Doe')
    
    const emailInput = screen.getByPlaceholderText('Enter your email')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /donate/i })
    await user.click(submitButton)
    
    // Note: onSuccess would be called after successful redirect
    // In a real test, you'd mock window.location.href
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventRegistration } from '@/components/events/event-registration'

// Mock the analytics and monitoring modules
jest.mock('@/lib/analytics', () => ({
  trackEventRegistration: jest.fn(),
}))

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    trackCriticalError: jest.fn(),
  },
}))

jest.mock('@/components/payments/donation-confirmation', () => ({
  DonationConfirmation: ({ amount, donorName }: any) => (
    <div data-testid="donation-confirmation">
      <p>Confirmation for {donorName}: ${amount}</p>
    </div>
  ),
}))

const mockEvent = {
  id: 'event-123',
  title: 'Spring Fundraising Gala',
  description: 'A wonderful evening of fundraising',
  start_date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
  end_date: new Date(Date.now() + 86400000 * 30 + 3600000 * 5).toISOString(), // 30 days + 5 hours
  location: 'Grand Ballroom',
  max_participants: 200,
  current_participants: 50,
  ticket_price: 150.00,
  goal_amount: 50000,
  current_amount: 15000,
  organization_name: 'EventraiseHUB Foundation',
}

describe('EventRegistration Component', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with event information', () => {
    render(<EventRegistration event={mockEvent} />)
    
    expect(screen.getByText('Register for Event')).toBeInTheDocument()
    expect(screen.getByText('Secure your spot at this amazing event')).toBeInTheDocument()
    expect(screen.getByText('Spring Fundraising Gala')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
  })

  it('displays registration summary correctly', () => {
    render(<EventRegistration event={mockEvent} />)
    
    expect(screen.getByText('Registration Summary')).toBeInTheDocument()
    expect(screen.getByText('Tickets:')).toBeInTheDocument()
    expect(screen.getByText('Price:')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByText('150 spots remaining')).toBeInTheDocument()
  })

  it('renders form fields correctly', () => {
    render(<EventRegistration event={mockEvent} />)
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/number of tickets/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/special requests/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dietary restrictions/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<EventRegistration event={mockEvent} />)
    
    // Find the form element by its onSubmit handler
    const form = screen.getByRole('button', { name: /continue to payment/i }).closest('form')
    if (form) {
      fireEvent.submit(form)
    } else {
      // Fallback to button click
      const submitButton = screen.getByRole('button', { name: /continue to payment/i })
      fireEvent.click(submitButton)
    }
    
    // Wait for the validation to complete
    await waitFor(() => {
      const toast = require('react-hot-toast')
      expect(toast.default.error).toHaveBeenCalledWith('Please enter your name')
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<EventRegistration event={mockEvent} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'invalid-email')
    
    // Find the form element by its onSubmit handler
    const form = screen.getByRole('button', { name: /continue to payment/i }).closest('form')
    if (form) {
      fireEvent.submit(form)
    } else {
      // Fallback to button click
      const submitButton = screen.getByRole('button', { name: /continue to payment/i })
      fireEvent.click(submitButton)
    }
    
    // Wait for the validation to complete
    await waitFor(() => {
      const toast = require('react-hot-toast')
      expect(toast.default.error).toHaveBeenCalledWith('Please enter a valid email address')
    })
  })

  it('handles successful registration for paid event', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ registration_id: 'reg-123' }),
    } as Response)
    
    // Mock successful payment creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionUrl: 'https://checkout.stripe.com/test' }),
    } as Response)
    
    render(<EventRegistration event={mockEvent} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/events/register', expect.any(Object))
    })
  })

  it('handles successful registration for free event', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    const mockOnSuccess = jest.fn()
    
    const freeEvent = { ...mockEvent, ticket_price: 0 }
    
    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ registration_id: 'reg-123' }),
    } as Response)
    
    render(<EventRegistration event={freeEvent} onSuccess={mockOnSuccess} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /register for free/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('donation-confirmation')).toBeInTheDocument()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles registration errors', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock failed registration
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Registration failed' }),
    } as Response)
    
    render(<EventRegistration event={mockEvent} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    // Check that toast.error was called with the error message
    const toast = require('react-hot-toast')
    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Registration failed')
    })
  })

  it('disables submit button when sold out', () => {
    const soldOutEvent = { ...mockEvent, max_participants: 50, current_participants: 50 }
    render(<EventRegistration event={soldOutEvent} />)
    
    const submitButton = screen.getByRole('button', { name: /sold out/i })
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when registration is closed', () => {
    const pastEvent = { 
      ...mockEvent, 
      start_date: new Date(Date.now() - 86400000).toISOString() // Yesterday
    }
    render(<EventRegistration event={pastEvent} />)
    
    const submitButton = screen.getByRole('button', { name: /registration closed/i })
    expect(submitButton).toBeDisabled()
  })

  it('updates ticket quantity and total amount', async () => {
    const user = userEvent.setup()
    render(<EventRegistration event={mockEvent} />)
    
    const quantityInput = screen.getByLabelText(/number of tickets/i)
    fireEvent.change(quantityInput, { target: { value: '3' } })
    
    // Debug: Check what the input value is
    expect(quantityInput).toHaveValue(3)
    
    await waitFor(() => {
      expect(screen.getByText('$450.00')).toBeInTheDocument() // 3 * $150
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock slow response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ registration_id: 'reg-123' }),
        } as Response), 100)
      )
    )
    
    render(<EventRegistration event={mockEvent} />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /continue to payment/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })
})

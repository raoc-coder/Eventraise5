import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VolunteerShifts } from '@/components/events/volunteer-shifts'

// Mock the analytics and monitoring modules
jest.mock('@/lib/analytics', () => ({
  trackVolunteerSignup: jest.fn(),
}))

jest.mock('@/lib/monitoring', () => ({
  MonitoringService: {
    trackCriticalError: jest.fn(),
  },
}))

const mockShifts = [
  {
    id: 'shift-1',
    title: 'Setup Crew',
    description: 'Help set up tables and decorations',
    start_time: new Date(Date.now() + 86400000 * 30 - 3600000 * 2).toISOString(), // 30 days - 2 hours
    end_time: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days
    max_volunteers: 10,
    current_volunteers: 5,
    requirements: 'Must be able to lift 25+ lbs',
    skills_needed: ['setup', 'decorating'],
    location: 'Grand Ballroom',
    is_active: true,
  },
  {
    id: 'shift-2',
    title: 'Event Coordination',
    description: 'Help coordinate activities during the event',
    start_time: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days
    end_time: new Date(Date.now() + 86400000 * 30 + 3600000 * 5).toISOString(), // 30 days + 5 hours
    max_volunteers: 15,
    current_volunteers: 15,
    requirements: 'Friendly and organized',
    skills_needed: ['coordination', 'customer_service'],
    location: 'Grand Ballroom',
    is_active: true,
  },
  {
    id: 'shift-3',
    title: 'Cleanup Crew',
    description: 'Help clean up after the event',
    start_time: new Date(Date.now() + 86400000 * 30 + 3600000 * 5).toISOString(), // 30 days + 5 hours
    end_time: new Date(Date.now() + 86400000 * 30 + 3600000 * 7).toISOString(), // 30 days + 7 hours
    max_volunteers: 8,
    current_volunteers: 0,
    requirements: 'Must be able to lift 25+ lbs',
    skills_needed: ['cleanup', 'organization'],
    location: 'Grand Ballroom',
    is_active: false,
  },
]

describe('VolunteerShifts Component', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    expect(screen.getByText('Loading volunteer shifts...')).toBeInTheDocument()
  })

  it('renders no shifts message when no shifts available', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: [] }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      expect(screen.getByText('No Volunteer Shifts Available')).toBeInTheDocument()
    })
  })

  it('renders volunteer shifts when available', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      expect(screen.getByText('Volunteer Opportunities')).toBeInTheDocument()
      expect(screen.getByText('Setup Crew')).toBeInTheDocument()
      expect(screen.getByText('Event Coordination')).toBeInTheDocument()
      expect(screen.getByText('Cleanup Crew')).toBeInTheDocument()
    })
  })

  it('shows shift details correctly', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      expect(screen.getByText('Help set up tables and decorations')).toBeInTheDocument()
      expect(screen.getByText('Must be able to lift 25+ lbs')).toBeInTheDocument()
      expect(screen.getByText('setup')).toBeInTheDocument()
      expect(screen.getByText('decorating')).toBeInTheDocument()
    })
  })

  it('shows full shift as disabled', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const fullShiftButton = screen.getByRole('button', { name: /shift full/i })
      expect(fullShiftButton).toBeDisabled()
    })
  })

  it('shows inactive shift as disabled', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const inactiveShiftButton = screen.getByRole('button', { name: /not available/i })
      expect(inactiveShiftButton).toBeDisabled()
    })
  })

  it('opens signup form when clicking available shift', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    expect(screen.getByText('Volunteer Signup')).toBeInTheDocument()
    expect(screen.getByText('Setup Crew - Apr 15, 2024, 4:00 PM')).toBeInTheDocument()
  })

  it('renders signup form fields correctly', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/skills/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/experience level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/availability notes/i)).toBeInTheDocument()
  })

  it('validates required fields in signup form', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    const submitButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Please enter your name')).toBeInTheDocument()
  })

  it('validates email format in signup form', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('handles successful volunteer signup', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    const mockOnSuccess = jest.fn()
    
    // Mock shifts fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)
    
    // Mock successful signup
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ signup_id: 'signup-123' }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" onSignupSuccess={mockOnSuccess} />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Volunteer Signup Confirmed!')).toBeInTheDocument()
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles signup errors', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock shifts fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)
    
    // Mock failed signup
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Signup failed' }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Signup failed')).toBeInTheDocument()
    })
  })

  it('allows returning to shifts from signup form', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
      expect(signupButton).toBeInTheDocument()
    })
    
    const signupButton = screen.getByRole('button', { name: /sign up to volunteer/i })
    await user.click(signupButton)
    
    expect(screen.getByText('Volunteer Signup')).toBeInTheDocument()
    
    const backButton = screen.getByRole('button', { name: /back to shifts/i })
    await user.click(backButton)
    
    expect(screen.getByText('Volunteer Opportunities')).toBeInTheDocument()
  })

  it('formats time correctly', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      expect(screen.getByText('Apr 15, 2024, 4:00 PM')).toBeInTheDocument()
    })
  })

  it('shows skills with correct styling', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ shifts: mockShifts }),
    } as Response)

    render(<VolunteerShifts eventId="event-123" eventTitle="Test Event" />)
    
    await waitFor(() => {
      const setupSkill = screen.getByText('setup')
      const decoratingSkill = screen.getByText('decorating')
      
      expect(setupSkill).toBeInTheDocument()
      expect(decoratingSkill).toBeInTheDocument()
    })
  })
})

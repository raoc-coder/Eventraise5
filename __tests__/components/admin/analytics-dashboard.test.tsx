import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard'

// Mock the CSV export service
jest.mock('@/lib/csv-export', () => ({
  CSVExportService: {
    exportDonations: jest.fn(),
    exportEventRegistrations: jest.fn(),
    exportVolunteers: jest.fn(),
    exportCampaignAnalytics: jest.fn(),
  },
}))

const mockAnalyticsData = {
  summary: {
    totalDonations: 150,
    totalDonationAmount: 25000,
    averageDonation: 166.67,
    totalRegistrations: 75,
    totalRegistrationAmount: 15000,
    averageRegistration: 200,
    totalVolunteers: 45,
    confirmedVolunteers: 40,
    totalRevenue: 40000,
  },
  monthlyData: [
    {
      month: '2024-01',
      donations: 25,
      registrations: 15,
      revenue: 8000,
    },
    {
      month: '2024-02',
      donations: 30,
      registrations: 20,
      revenue: 10000,
    },
  ],
  campaignPerformance: [
    {
      id: 'camp-1',
      title: 'Spring Fundraiser',
      goal_amount: 50000,
      current_amount: 30000,
      progress_percentage: 60,
      donation_count: 100,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
  eventPerformance: [
    {
      id: 'event-1',
      title: 'Gala Dinner',
      start_date: '2024-04-15T18:00:00Z',
      end_date: '2024-04-15T23:00:00Z',
      max_participants: 200,
      current_participants: 150,
      capacity_percentage: 75,
      ticket_price: 150,
      registration_count: 150,
    },
  ],
}

describe('AnalyticsDashboard Component', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with initial data', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Analytics Filters')).toBeInTheDocument()
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('Total Donations')).toBeInTheDocument()
    expect(screen.getByText('Event Registrations')).toBeInTheDocument()
    expect(screen.getByText('Volunteers')).toBeInTheDocument()
  })

  it('displays summary metrics correctly', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('$40,000.00')).toBeInTheDocument() // Total Revenue
    expect(screen.getByText('150')).toBeInTheDocument() // Total Donations
    expect(screen.getByText('75')).toBeInTheDocument() // Event Registrations
    expect(screen.getByText('45')).toBeInTheDocument() // Volunteers
  })

  it('shows campaign performance when available', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Campaign Performance')).toBeInTheDocument()
    expect(screen.getByText('Spring Fundraiser')).toBeInTheDocument()
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('$30,000.00')).toBeInTheDocument()
  })

  it('shows event performance when available', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Event Performance')).toBeInTheDocument()
    expect(screen.getByText('Gala Dinner')).toBeInTheDocument()
    expect(screen.getByText('75.0%')).toBeInTheDocument()
    expect(screen.getByText('150/200')).toBeInTheDocument()
  })

  it('shows monthly revenue data', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument()
    expect(screen.getByText('January 2024')).toBeInTheDocument()
    expect(screen.getByText('February 2024')).toBeInTheDocument()
  })

  it('renders export buttons', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Export Data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /donations/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /registrations/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /volunteers/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analytics/i })).toBeInTheDocument()
  })

  it('handles filter changes', async () => {
    const user = userEvent.setup()
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)
    
    await user.type(startDateInput, '2024-01-01')
    await user.type(endDateInput, '2024-12-31')
    
    expect(startDateInput).toHaveValue('2024-01-01')
    expect(endDateInput).toHaveValue('2024-12-31')
  })

  it('handles refresh button click', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockAnalyticsData }),
    } as Response)
    
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/reports', expect.any(Object))
    })
  })

  it('handles export button clicks', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock successful export
    mockFetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob(['test,csv,data'], { type: 'text/csv' }),
    } as Response)
    
    // Mock URL.createObjectURL and document.createElement
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url')
    global.URL.revokeObjectURL = jest.fn()
    
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    }
    const mockCreateElement = jest.fn(() => mockLink)
    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
    })
    Object.defineProperty(document.body, 'appendChild', { value: jest.fn() })
    Object.defineProperty(document.body, 'removeChild', { value: jest.fn() })
    
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    const donationsExportButton = screen.getByRole('button', { name: /donations/i })
    await user.click(donationsExportButton)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/reports?type=donations'),
        expect.any(Object)
      )
    })
  })

  it('shows loading state during refresh', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    // Mock slow response
    mockFetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ data: mockAnalyticsData }),
        } as Response), 100)
      )
    )
    
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    
    mockFetch.mockRejectedValueOnce(new Error('API Error'))
    
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics data')).toBeInTheDocument()
    })
  })

  it('formats currency correctly', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('$40,000.00')).toBeInTheDocument()
    expect(screen.getByText('$30,000.00')).toBeInTheDocument()
  })

  it('formats percentages correctly', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('75.0%')).toBeInTheDocument()
  })

  it('shows progress bars for campaigns', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    const progressBars = screen.getAllByRole('progressbar', { hidden: true })
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('displays campaign details correctly', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Spring Fundraiser')).toBeInTheDocument()
    expect(screen.getByText('Raised:')).toBeInTheDocument()
    expect(screen.getByText('Goal:')).toBeInTheDocument()
    expect(screen.getByText('Donations:')).toBeInTheDocument()
    expect(screen.getByText('Created:')).toBeInTheDocument()
  })

  it('displays event details correctly', () => {
    render(<AnalyticsDashboard initialData={mockAnalyticsData} />)
    
    expect(screen.getByText('Gala Dinner')).toBeInTheDocument()
    expect(screen.getByText('Date:')).toBeInTheDocument()
    expect(screen.getByText('Capacity:')).toBeInTheDocument()
    expect(screen.getByText('Price:')).toBeInTheDocument()
    expect(screen.getByText('Registrations:')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyData = {
      summary: {
        totalDonations: 0,
        totalDonationAmount: 0,
        averageDonation: 0,
        totalRegistrations: 0,
        totalRegistrationAmount: 0,
        averageRegistration: 0,
        totalVolunteers: 0,
        confirmedVolunteers: 0,
        totalRevenue: 0,
      },
      monthlyData: [],
      campaignPerformance: [],
      eventPerformance: [],
    }
    
    render(<AnalyticsDashboard initialData={emptyData} />)
    
    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders without initial data', () => {
    render(<AnalyticsDashboard />)
    
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
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
    expect(screen.getByText('50.0% of goal reached')).toBeInTheDocument()
  })

  it('renders preset amount buttons', () => {
    render(<DonationForm {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: '$25' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$50' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$100' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$250' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '$500' })).toBeInTheDocument()
  })

  it('renders custom amount input', () => {
    render(<DonationForm {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Enter custom amount')).toBeInTheDocument()
  })

  it('renders donate button', () => {
    render(<DonationForm {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: /donate/i })).toBeInTheDocument()
  })
})
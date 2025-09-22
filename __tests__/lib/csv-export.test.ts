import { CSVExportService } from '@/lib/csv-export'

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
      })),
    })),
  })),
}

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}))

describe('CSVExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('exportDonations', () => {
    it('exports donations with basic data', async () => {
      const mockDonations = [
        {
          id: 'donation-1',
          campaign_id: 'campaign-1',
          amount: 100,
          donor_name: 'John Doe',
          donor_email: 'john@example.com',
          payment_intent_id: 'pi_123',
          checkout_session_id: 'cs_123',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          campaigns: { title: 'Spring Fundraiser' },
        },
      ]

      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: mockDonations,
        error: null,
      })

      const result = await CSVExportService.exportDonations()

      expect(result).toContain('id,campaign_id,campaign_title,amount')
      expect(result).toContain('donation-1')
      expect(result).toContain('Spring Fundraiser')
      expect(result).toContain('100')
    })

    it('exports donations with privacy controls', async () => {
      const mockDonations = [
        {
          id: 'donation-1',
          campaign_id: 'campaign-1',
          amount: 100,
          donor_name: 'John Doe',
          donor_email: 'john@example.com',
          payment_intent_id: 'pi_123',
          checkout_session_id: 'cs_123',
          status: 'completed',
          created_at: '2024-01-15T10:00:00Z',
          campaigns: { title: 'Spring Fundraiser' },
        },
      ]

      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: mockDonations,
        error: null,
      })

      const result = await CSVExportService.exportDonations({
        includePersonalData: false,
      })

      expect(result).toContain('Anonymous')
      expect(result).toContain('***@***.***')
    })

    it('handles database errors', async () => {
      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(CSVExportService.exportDonations()).rejects.toThrow('Failed to fetch donations: Database error')
    })

    it('handles missing supabase client', async () => {
      jest.doMock('@/lib/supabase', () => ({
        supabase: null,
      }))

      await expect(CSVExportService.exportDonations()).rejects.toThrow('Database not configured')
    })
  })

  describe('exportEventRegistrations', () => {
    it('exports event registrations with basic data', async () => {
      const mockRegistrations = [
        {
          id: 'registration-1',
          event_id: 'event-1',
          participant_name: 'Jane Smith',
          participant_email: 'jane@example.com',
          participant_phone: '555-1234',
          ticket_quantity: 2,
          total_amount: 300,
          status: 'confirmed',
          registration_date: '2024-01-15T10:00:00Z',
          special_requests: 'Vegetarian meal',
          dietary_restrictions: 'No nuts',
          events: { title: 'Gala Dinner' },
        },
      ]

      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: mockRegistrations,
        error: null,
      })

      const result = await CSVExportService.exportEventRegistrations()

      expect(result).toContain('id,event_id,event_title,participant_name')
      expect(result).toContain('registration-1')
      expect(result).toContain('Gala Dinner')
      expect(result).toContain('Jane Smith')
    })

    it('exports event registrations with privacy controls', async () => {
      const mockRegistrations = [
        {
          id: 'registration-1',
          event_id: 'event-1',
          participant_name: 'Jane Smith',
          participant_email: 'jane@example.com',
          participant_phone: '555-1234',
          ticket_quantity: 2,
          total_amount: 300,
          status: 'confirmed',
          registration_date: '2024-01-15T10:00:00Z',
          special_requests: 'Vegetarian meal',
          dietary_restrictions: 'No nuts',
          events: { title: 'Gala Dinner' },
        },
      ]

      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: mockRegistrations,
        error: null,
      })

      const result = await CSVExportService.exportEventRegistrations({
        includePersonalData: false,
      })

      expect(result).toContain('Anonymous')
      expect(result).toContain('***@***.***')
      expect(result).toContain('***-***-****')
    })
  })

  describe('exportVolunteers', () => {
    it('exports volunteers with basic data', async () => {
      const mockVolunteers = [
        {
          id: 'volunteer-1',
          shift_id: 'shift-1',
          volunteer_name: 'Bob Wilson',
          volunteer_email: 'bob@example.com',
          volunteer_phone: '555-5678',
          skills: ['setup', 'decorating'],
          experience_level: 'intermediate',
          status: 'confirmed',
          signed_up_at: '2024-01-15T10:00:00Z',
          volunteer_shifts: {
            title: 'Setup Crew',
            events: { title: 'Gala Dinner' },
          },
        },
      ]

      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: mockVolunteers,
        error: null,
      })

      const result = await CSVExportService.exportVolunteers()

      expect(result).toContain('id,shift_id,shift_title,event_title')
      expect(result).toContain('volunteer-1')
      expect(result).toContain('Setup Crew')
      expect(result).toContain('Gala Dinner')
    })

    it('exports volunteers with privacy controls', async () => {
      const mockVolunteers = [
        {
          id: 'volunteer-1',
          shift_id: 'shift-1',
          volunteer_name: 'Bob Wilson',
          volunteer_email: 'bob@example.com',
          volunteer_phone: '555-5678',
          skills: ['setup', 'decorating'],
          experience_level: 'intermediate',
          status: 'confirmed',
          signed_up_at: '2024-01-15T10:00:00Z',
          volunteer_shifts: {
            title: 'Setup Crew',
            events: { title: 'Gala Dinner' },
          },
        },
      ]

      mockSupabase.from().select().eq().gte().lte().order().mockResolvedValue({
        data: mockVolunteers,
        error: null,
      })

      const result = await CSVExportService.exportVolunteers({
        includePersonalData: false,
      })

      expect(result).toContain('Anonymous')
      expect(result).toContain('***@***.***')
      expect(result).toContain('***-***-****')
    })
  })

  describe('exportCampaignAnalytics', () => {
    it('exports campaign analytics', async () => {
      const mockCampaign = {
        id: 'campaign-1',
        title: 'Spring Fundraiser',
        goal_amount: 50000,
        current_amount: 30000,
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockDonations = [
        { amount: 100 },
        { amount: 200 },
        { amount: 300 },
      ]

      // Mock campaign fetch
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockCampaign,
        error: null,
      })

      // Mock donations fetch
      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: mockDonations,
        error: null,
      })

      const result = await CSVExportService.exportCampaignAnalytics('campaign-1')

      expect(result).toContain('Campaign Title')
      expect(result).toContain('Spring Fundraiser')
      expect(result).toContain('Total Donations')
      expect(result).toContain('3')
      expect(result).toContain('Total Amount Raised')
      expect(result).toContain('$600.00')
    })

    it('handles campaign not found', async () => {
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: { message: 'Campaign not found' },
      })

      await expect(CSVExportService.exportCampaignAnalytics('invalid-id')).rejects.toThrow('Campaign not found')
    })
  })

  describe('convertToCSV', () => {
    it('converts data to CSV format', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Boston' },
      ]

      const result = CSVExportService['convertToCSV'](data, 'test')

      expect(result).toContain('name,age,city')
      expect(result).toContain('John,30,New York')
      expect(result).toContain('Jane,25,Boston')
    })

    it('handles empty data', () => {
      const result = CSVExportService['convertToCSV']([], 'test')

      expect(result).toBe('No data available')
    })

    it('escapes special characters in CSV', () => {
      const data = [
        { name: 'John "Johnny" Doe', description: 'A person, with commas' },
      ]

      const result = CSVExportService['convertToCSV'](data, 'test')

      expect(result).toContain('"John ""Johnny"" Doe"')
      expect(result).toContain('"A person, with commas"')
    })
  })

  describe('downloadCSV', () => {
    beforeEach(() => {
      // Mock DOM methods
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
    })

    it('creates and triggers download', () => {
      const csvContent = 'name,age\nJohn,30'
      const filename = 'test'

      CSVExportService.downloadCSV(csvContent, filename)

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(document.createElement).toHaveBeenCalledWith('a')
    })
  })
})

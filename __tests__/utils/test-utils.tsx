import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock campaign data for tests
export const mockCampaign = {
  id: 'test-campaign-id',
  title: 'Test Campaign',
  description: 'A test campaign for testing purposes',
  goal_amount: 10000,
  current_amount: 5000,
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z',
  organization_name: 'Test Organization',
  category: 'Education',
  image_url: '/test-image.jpg',
  is_featured: true,
}

// Simple render function for tests
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Simple test to make this file valid
describe('Test Utils', () => {
  it('should export mock campaign data', () => {
    expect(mockCampaign).toBeDefined()
    expect(mockCampaign.id).toBe('test-campaign-id')
    expect(mockCampaign.title).toBe('Test Campaign')
  })
})

import { render, screen } from '@testing-library/react'
import { BentoGrid } from '@/components/ui/bento-grid'
import { Zap } from 'lucide-react'

describe('BentoGrid', () => {
  it('renders item titles and descriptions', () => {
    render(
      <BentoGrid
        items={[
          {
            title: 'Test feature',
            description: 'Test description',
            icon: <Zap data-testid="icon" />,
            tags: ['Alpha'],
          },
        ]}
      />,
    )
    expect(screen.getByText('Test feature')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('#Alpha')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders default sample items when items prop is omitted', () => {
    render(<BentoGrid />)
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Global Network')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { Features } from '@/components/ui/features-2'
import { Zap } from 'lucide-react'

describe('Features', () => {
  it('renders heading and default feature cards', () => {
    render(<Features />)
    expect(
      screen.getByRole('heading', { name: /built to cover your needs/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/customizable/i)).toBeInTheDocument()
    expect(screen.getByText(/powered by ai/i)).toBeInTheDocument()
  })

  it('renders custom items', () => {
    render(
      <Features
        heading="Our platform"
        subheading="Built for organizers"
        items={[
          {
            title: 'Fast setup',
            description: 'Launch in minutes.',
            icon: Zap,
          },
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: /our platform/i })).toBeInTheDocument()
    expect(screen.getByText(/fast setup/i)).toBeInTheDocument()
    expect(screen.getByText(/launch in minutes/i)).toBeInTheDocument()
  })
})

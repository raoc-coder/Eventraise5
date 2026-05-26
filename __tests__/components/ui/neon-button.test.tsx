import { render, screen } from '@testing-library/react'
import { NeonButton } from '@/components/ui/neon-button'

describe('NeonButton', () => {
  it('renders with default variant', () => {
    render(<NeonButton>Click me</NeonButton>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('rounded-full', 'border-blue-500/20')
  })

  it('renders solid variant', () => {
    render(<NeonButton variant="solid">Solid</NeonButton>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500')
  })

  it('can disable neon lines', () => {
    const { container } = render(<NeonButton neon={false}>Plain</NeonButton>)
    const decorativeSpans = container.querySelectorAll('button > span[aria-hidden]')
    decorativeSpans.forEach((span) => {
      expect(span).not.toHaveClass('block')
    })
  })

  it('applies custom className', () => {
    render(<NeonButton className="custom-class">Custom</NeonButton>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})

import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component - Simple Test', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SocialIcons } from '@/components/ui/social-icons'

describe('SocialIcons', () => {
  it('renders social links with labels', () => {
    render(
      <SocialIcons
        items={[
          {
            name: 'Test Network',
            href: 'https://example.com',
            icon: <span data-testid="icon" />,
          },
        ]}
      />,
    )
    const link = screen.getByRole('link', { name: /test network/i })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('shows tooltip label on hover', async () => {
    const user = userEvent.setup()
    render(
      <SocialIcons
        items={[
          {
            name: 'Hover Me',
            href: 'https://example.com',
            icon: <span />,
          },
        ]}
      />,
    )
    await user.hover(screen.getByRole('link', { name: /hover me/i }))
    expect(screen.getAllByText('Hover Me').length).toBeGreaterThanOrEqual(1)
  })

  it('renders default EventraiseHub social links', () => {
    render(<SocialIcons />)
    expect(screen.getByRole('link', { name: /facebook/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /instagram/i })).toBeInTheDocument()
  })
})

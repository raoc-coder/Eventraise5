import { render, screen } from '@testing-library/react'
import { CallToAction } from '@/components/ui/cta-3'

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) {
    return <a href={href}>{children}</a>
  }
})

describe('CallToAction', () => {
  it('renders title and description', () => {
    render(
      <CallToAction
        title="Custom title"
        description="Custom description"
        primaryHref="/start"
        secondaryHref="/sales"
      />,
    )
    expect(screen.getByRole('heading', { name: /custom title/i })).toBeInTheDocument()
    expect(screen.getByText(/custom description/i)).toBeInTheDocument()
  })

  it('renders primary and secondary actions with links', () => {
    render(
      <CallToAction
        primaryLabel="Go"
        secondaryLabel="Talk"
        primaryHref="/go"
        secondaryHref="/talk"
      />,
    )
    expect(screen.getByRole('link', { name: /go/i })).toHaveAttribute('href', '/go')
    expect(screen.getByRole('link', { name: /talk/i })).toHaveAttribute('href', '/talk')
  })

  it('uses default copy when props are omitted', () => {
    render(<CallToAction />)
    expect(
      screen.getByRole('heading', { name: /let your plans shape the future/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/no credit card required/i)).toBeInTheDocument()
  })
})

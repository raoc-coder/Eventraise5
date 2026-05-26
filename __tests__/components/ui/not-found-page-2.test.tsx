import { render, screen } from '@testing-library/react'
import { NotFoundPage } from '@/components/ui/not-found-page-2'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
    }: {
      children: React.ReactNode
      className?: string
    }) => <div className={className}>{children}</div>,
  },
  useReducedMotion: () => true,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => <div data-testid="bg-image" />,
}))

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

describe('NotFoundPage', () => {
  it('renders 404 message and navigation links', () => {
    render(<NotFoundPage homeHref="/" exploreHref="/events" />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: /explore events/i })).toHaveAttribute(
      'href',
      '/events',
    )
  })
})

import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/ui/hero'

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

describe('Hero', () => {
  it('renders title, subtitle, and actions', () => {
    render(
      <Hero
        title="Test headline"
        subtitle="Test subcopy"
        actions={[
          { label: 'Start', href: '/start' },
          { label: 'Learn', href: '/learn', variant: 'outline' },
        ]}
      />,
    )
    expect(
      screen.getByRole('heading', { name: /test headline/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/test subcopy/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start/i })).toHaveAttribute(
      'href',
      '/start',
    )
    expect(screen.getByRole('link', { name: /learn/i })).toHaveAttribute(
      'href',
      '/learn',
    )
  })

  it('can hide gradient effects', () => {
    const { container } = render(
      <Hero title="Plain" gradient={false} />,
    )
    expect(container.querySelector('.blur-3xl')).not.toBeInTheDocument()
  })
})

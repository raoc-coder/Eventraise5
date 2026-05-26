import { render, screen } from '@testing-library/react'
import { FooterSection } from '@/components/ui/footer-section'

jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
  useReducedMotion: () => true,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string }) => <img alt={props.alt} />,
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

describe('FooterSection', () => {
  it('renders brand and copyright', () => {
    render(<FooterSection brandName="EventraiseHub" />)
    expect(
      screen.getByText(new RegExp(`${new Date().getFullYear()} EventraiseHub`, 'i')),
    ).toBeInTheDocument()
  })

  it('renders link sections', () => {
    render(<FooterSection />)
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pricing/i })).toHaveAttribute(
      'href',
      '/pricing',
    )
    expect(screen.getByRole('link', { name: /facebook/i })).toHaveAttribute(
      'href',
      expect.stringContaining('facebook.com'),
    )
  })
})

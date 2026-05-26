import { render } from '@testing-library/react'
import { Sparkles } from '@/components/ui/sparkles'

jest.mock('@tsparticles/react', () => ({
  initParticlesEngine: jest.fn(() => Promise.resolve()),
  __esModule: true,
  default: () => <div data-testid="particles" />,
}))

jest.mock('@tsparticles/slim', () => ({
  loadSlim: jest.fn(),
}))

describe('Sparkles', () => {
  it('renders nothing until the engine is ready', () => {
    const { container } = render(<Sparkles className="h-10 w-10" />)
    expect(container).toBeEmptyDOMElement()
  })
})

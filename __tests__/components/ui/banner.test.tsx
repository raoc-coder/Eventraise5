import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Banner } from '@/components/ui/banner'

describe('Banner', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(
      <Banner show={false} title="Hidden" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders title and description when visible', () => {
    render(
      <Banner
        show
        title="Test banner"
        description="More details"
        variant="info"
      />,
    )
    expect(screen.getByText('Test banner')).toBeInTheDocument()
    expect(screen.getByText('More details')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('calls onHide when close button is clicked', async () => {
    const user = userEvent.setup()
    const onHide = jest.fn()
    render(
      <Banner show closable title="Closable" onHide={onHide} />,
    )
    await user.click(screen.getByRole('button', { name: /dismiss banner/i }))
    expect(onHide).toHaveBeenCalledTimes(1)
  })

  it('auto-hides after the configured delay', () => {
    jest.useFakeTimers()
    const onHide = jest.fn()
    render(
      <Banner show title="Timed" autoHide={3000} onHide={onHide} />,
    )
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(onHide).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })
})

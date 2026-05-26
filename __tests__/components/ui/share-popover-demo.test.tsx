import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SharePopoverDemo } from '@/components/ui/share-popover-demo'

describe('SharePopoverDemo', () => {
  it('renders share trigger and opens panel', async () => {
    const user = userEvent.setup()
    render(<SharePopoverDemo shareUrl="https://example.com/event/1" />)

    await user.click(screen.getByRole('button', { name: /share/i }))
    expect(screen.getByText(/share this item/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://example.com/event/1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
  })
})

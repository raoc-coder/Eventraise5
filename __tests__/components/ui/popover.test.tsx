import { render, screen } from '@testing-library/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

describe('Popover', () => {
  it('renders trigger and content when open', () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Open menu</PopoverTrigger>
        <PopoverContent>Menu content</PopoverContent>
      </Popover>,
    )
    expect(screen.getByText('Open menu')).toBeInTheDocument()
    expect(screen.getByText('Menu content')).toBeInTheDocument()
  })
})

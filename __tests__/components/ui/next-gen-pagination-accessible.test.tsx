import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/ui/next-gen-pagination-accessible'

describe('Pagination', () => {
  it('renders range summary and page controls', () => {
    render(
      <Pagination
        totalItems={100}
        itemsPerPage={10}
        currentPage={1}
        onPageChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument()
    expect(screen.getByText(/showing 1–10 of 100 results/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go to page 2/i })).toBeInTheDocument()
  })

  it('calls onPageChange when a page is selected', async () => {
    const user = userEvent.setup()
    const onPageChange = jest.fn()
    render(
      <Pagination
        totalItems={50}
        itemsPerPage={10}
        currentPage={1}
        onPageChange={onPageChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /go to page 3/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables previous on first page', () => {
    render(
      <Pagination
        totalItems={30}
        itemsPerPage={10}
        currentPage={1}
        onPageChange={jest.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /go to previous page/i })).toBeDisabled()
  })
})

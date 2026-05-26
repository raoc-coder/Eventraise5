'use client'

import * as React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLastButtons?: boolean
  pageButtonLimit?: number
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  className,
  showFirstLastButtons = true,
  pageButtonLimit = 5,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const validatedCurrentPage = Math.max(1, Math.min(currentPage, totalPages))

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== validatedCurrentPage) {
      onPageChange(page)
    }
  }

  const renderPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxButtons = Math.max(1, pageButtonLimit)
    const halfLimit = Math.floor(maxButtons / 2)

    let startPage = Math.max(1, validatedCurrentPage - halfLimit)
    let endPage = Math.min(totalPages, validatedCurrentPage + halfLimit)

    if (endPage - startPage + 1 < maxButtons) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxButtons - 1)
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxButtons + 1)
      }
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('ellipsis')
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis')
      }
      pages.push(totalPages)
    }

    return pages.map((page, index) =>
      page === 'ellipsis' ? (
        <span
          key={`ellipsis-${index}`}
          className="px-2 text-muted-foreground"
          aria-hidden
        >
          …
        </span>
      ) : (
        <Button
          key={page}
          type="button"
          variant={page === validatedCurrentPage ? 'default' : 'outline'}
          size="icon"
          className={cn(
            'h-8 w-8 text-sm font-semibold transition-colors duration-150',
            page === validatedCurrentPage &&
              'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
          onClick={() => handlePageChange(page)}
          disabled={page === validatedCurrentPage}
          aria-current={page === validatedCurrentPage ? 'page' : undefined}
          aria-label={`Go to page ${page}`}
        >
          {page}
        </Button>
      ),
    )
  }

  const isFirstPage = validatedCurrentPage === 1
  const isLastPage = validatedCurrentPage === totalPages
  const rangeStart =
    totalItems === 0 ? 0 : (validatedCurrentPage - 1) * itemsPerPage + 1
  const rangeEnd = Math.min(validatedCurrentPage * itemsPerPage, totalItems)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 px-2 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:space-x-2 sm:px-4',
        className,
      )}
      role="navigation"
      aria-label="Pagination"
    >
      <div className="flex-1 text-left">
        Showing {rangeStart}–{rangeEnd} of {totalItems} results
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showFirstLastButtons && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            onClick={() => handlePageChange(1)}
            disabled={isFirstPage}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden />
            <span className="sr-only">First page</span>
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
          onClick={() => handlePageChange(validatedCurrentPage - 1)}
          disabled={isFirstPage}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="sr-only">Previous page</span>
        </Button>

        {renderPageNumbers()}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
          onClick={() => handlePageChange(validatedCurrentPage + 1)}
          disabled={isLastPage}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="sr-only">Next page</span>
        </Button>
        {showFirstLastButtons && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
            onClick={() => handlePageChange(totalPages)}
            disabled={isLastPage}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden />
            <span className="sr-only">Last page</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export function PaginationDemo() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalItems = 100
  const itemsPerPage = 10

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = Array.from({ length: totalItems }, (_, i) => `Item ${i + 1}`).slice(
    startIndex,
    endIndex,
  )

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-lg border bg-card p-8">
      <h3 className="text-xl font-semibold text-foreground">
        Content for current page
      </h3>
      <div className="min-h-[150px] rounded-md bg-muted/50 p-4">
        <p className="mb-2 text-sm text-muted-foreground">
          Displaying items {startIndex + 1} to {endIndex} of {totalItems}.
        </p>
        <ul className="grid grid-cols-2 gap-2 text-foreground sm:grid-cols-3 md:grid-cols-4">
          {currentItems.map((item) => (
            <li
              key={item}
              className="rounded-sm border border-dashed p-1 text-center text-sm"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        className="mt-4"
        showFirstLastButtons
        pageButtonLimit={5}
      />
    </div>
  )
}

/** Alias matching the original demo export name */
export { PaginationDemo as ExampleUsage }
export default PaginationDemo

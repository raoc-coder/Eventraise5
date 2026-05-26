import { renderHook, act } from '@testing-library/react'
import { useOverflow } from '@/hooks/use-item-overflow'

jest.mock('usehooks-ts', () => ({
  useResizeObserver: jest.fn(),
}))

describe('useOverflow', () => {
  it('returns containerRef, registerItem, and helpers', () => {
    const { result } = renderHook(() =>
      useOverflow({ total: 3, max: 5, gap: 8 }),
    )

    expect(result.current.containerRef).toBeDefined()
    expect(result.current.registerItem(0)).toBeInstanceOf(Function)
    expect(result.current.visibleCount).toBe(3)
    expect(result.current.hiddenCount).toBe(0)
    expect(result.current.isVisible(0)).toBe(true)
    expect(result.current.isVisible(2)).toBe(true)
  })

  it('computes hiddenCount from visibleCount', () => {
    const { result } = renderHook(() => useOverflow({ total: 5 }))

    act(() => {
      // Simulate measurement reducing visible items
      result.current.isVisible(4)
    })

    expect(result.current.hiddenCount).toBeGreaterThanOrEqual(0)
    expect(result.current.hiddenCount).toBe(
      Math.max(0, 5 - result.current.visibleCount),
    )
  })
})

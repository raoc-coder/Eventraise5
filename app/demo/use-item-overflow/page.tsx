'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useOverflow } from '@/hooks/use-item-overflow'
import { Button } from '@/components/ui/button'

function OverflowDemo() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 5 }, (_, i) => `Item ${i + 1}`),
  )

  const [maxItems, setMaxItems] = useState(Infinity)

  const { containerRef, registerItem, isVisible, hiddenCount } = useOverflow({
    total: items.length,
    max: maxItems,
    gap: 8,
  })

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setItems((prev) => [...prev, `Item ${prev.length + 1}`])
          }
        >
          Add Item
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setItems((prev) => prev.slice(0, -1))}
          disabled={items.length === 0}
        >
          Remove Item
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => setMaxItems((prev) => (prev === 3 ? Infinity : 3))}
        >
          {maxItems === Infinity ? 'Limit to 3' : 'Remove Limit'}
        </Button>
      </div>

      <div className="w-full max-w-[500px] rounded-lg border p-4">
        <div ref={containerRef} className="relative flex flex-nowrap gap-2">
          {items.map((item, index) => (
            <Button
              key={`${item}-${index}`}
              ref={registerItem(index)}
              size="sm"
              variant="secondary"
              type="button"
              className="shrink-0 transition-opacity duration-200"
              style={{
                opacity: isVisible(index) ? 1 : 0,
                pointerEvents: isVisible(index) ? 'auto' : 'none',
                position: isVisible(index) ? 'relative' : 'absolute',
              }}
            >
              {item}
            </Button>
          ))}

          {hiddenCount > 0 && (
            <Button
              ref={registerItem(items.length)}
              size="sm"
              variant="outline"
              type="button"
              className="shrink-0"
            >
              +{hiddenCount} more
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UseItemOverflowDemoPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 -z-10 h-64">
        <Image
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-15"
          sizes="100vw"
        />
      </div>
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="mb-6 px-4 text-2xl font-bold text-foreground">
          Item overflow hook
        </h1>
        <OverflowDemo />
      </div>
    </div>
  )
}

export { OverflowDemo }

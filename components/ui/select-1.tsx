'use client'

import {
  Popover,
  type PopoverProps,
  composeRenderProps,
} from 'react-aria-components'
import { cn } from '@/lib/utils'

function SelectPopover({ className, ...props }: PopoverProps) {
  return (
    <Popover
      className={composeRenderProps(className, (className) =>
        cn(
          'z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none',
          'data-[entering]:animate-in data-[exiting]:animate-out',
          'data-[entering]:fade-in-0 data-[exiting]:fade-out-0',
          'data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95',
          className,
        ),
      )}
      {...props}
    />
  )
}

export { SelectPopover }

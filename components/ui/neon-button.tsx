import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const neonButtonVariants = cva(
  'relative group border text-foreground mx-auto text-center rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-blue-500/5 hover:bg-blue-500/0 border-blue-500/20',
        solid:
          'bg-blue-500 hover:bg-blue-600 text-white border-transparent hover:border-foreground/50 transition-all duration-200',
        ghost:
          'border-transparent bg-transparent hover:border-zinc-600 hover:bg-white/10',
      },
      size: {
        default: 'px-7 py-1.5',
        sm: 'px-4 py-0.5',
        lg: 'px-10 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  neon?: boolean
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    { className, neon = true, size, variant, children, type = 'button', ...props },
    ref,
  ) => {
    return (
      <button
        type={type}
        className={cn(neonButtonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 inset-y-0 mx-auto hidden h-px w-3/4 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 dark:via-blue-500',
            neon && 'block',
          )}
        />
        {children}
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 -bottom-px mx-auto hidden h-px w-3/4 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-30 dark:via-blue-500',
            neon && 'block',
          )}
        />
      </button>
    )
  },
)

NeonButton.displayName = 'NeonButton'

/** @deprecated Use named export `NeonButton` to avoid confusion with `components/ui/button`. */
const Button = NeonButton

export { NeonButton, Button, neonButtonVariants as buttonVariants }

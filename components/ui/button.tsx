import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-700 to-blue-800 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 active:scale-95",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/25 hover:shadow-red-400/40 active:scale-95",
        outline:
          "border border-blue-500/50 bg-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 active:bg-blue-100",
        secondary:
          "bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-600/25 hover:shadow-orange-500/40 active:scale-95",
        ghost: "text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
      },
      size: {
        default: "h-11 px-4 py-2 min-h-[44px] text-base",
        sm: "h-10 rounded-md px-3 min-h-[40px] text-sm",
        lg: "h-12 rounded-md px-8 min-h-[48px] text-lg",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
        mobile: "h-12 px-6 py-3 min-h-[48px] text-base w-full sm:w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }))

    if (asChild && React.isValidElement(children)) {
      // Clone child (e.g., Next Link's anchor) and merge className/props
      const child = children as React.ReactElement<any>
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        ...props,
      })
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)
ButtonComponent.displayName = "Button"

const Button = React.memo(ButtonComponent)
Button.displayName = "Button"

export { Button, buttonVariants }

import React from 'react'

// Accessibility improvements for EventraiseHUB components

export interface AccessibilityProps {
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-labelledby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-atomic'?: boolean
  'aria-busy'?: boolean
  'aria-disabled'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-valuemin'?: number
  'aria-valuemax'?: number
  'aria-valuenow'?: number
  'aria-valuetext'?: string
  role?: string
  tabIndex?: number
}

// Enhanced Button component with accessibility
export interface AccessibleButtonProps extends AccessibilityProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...accessibilityProps
}: AccessibleButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  }
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...accessibilityProps}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}

// Enhanced Input component with accessibility
export interface AccessibleInputProps extends AccessibilityProps {
  label: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  className?: string
}

export function AccessibleInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...accessibilityProps
}: AccessibleInputProps) {
  const id = React.useId()
  const errorId = `${id}-error`
  const describedBy = error ? errorId : undefined

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        aria-required={required}
        {...accessibilityProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  )
}

// Enhanced Card component with accessibility
export interface AccessibleCardProps extends AccessibilityProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function AccessibleCard({
  children,
  title,
  description,
  className = '',
  ...accessibilityProps
}: AccessibleCardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      role="region"
      aria-labelledby={title ? 'card-title' : undefined}
      aria-describedby={description ? 'card-description' : undefined}
      {...accessibilityProps}
    >
      {title && (
        <div className="p-6 pb-0">
          <h3 id="card-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {description && (
            <p id="card-description" className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// Loading spinner with accessibility
export interface AccessibleLoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AccessibleLoading({
  text = 'Loading...',
  size = 'md',
  className = '',
}: AccessibleLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="ml-2 text-sm text-gray-600">{text}</span>
    </div>
  )
}

// Progress bar with accessibility
export interface AccessibleProgressProps {
  value: number
  max?: number
  label?: string
  className?: string
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  className = '',
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100)
  const id = React.useId()

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          id={id}
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={`${percentage}% complete`}
        />
      </div>
      <p className="mt-1 text-sm text-gray-600" aria-live="polite">
        {percentage}% complete
      </p>
    </div>
  )
}

// Skip link for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      {children}
    </a>
  )
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Focus trap for modals
export function FocusTrap({ children, active }: { children: React.ReactNode; active: boolean }) {
  const trapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active || !trapRef.current) return

    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [active])

  return (
    <div ref={trapRef} className={active ? '' : 'hidden'}>
      {children}
    </div>
  )
}

// Announcement for screen readers
export function Announcement({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
  return (
    <div
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
    >
      {message}
    </div>
  )
}

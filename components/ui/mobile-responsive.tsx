import React from 'react'
import Image from 'next/image'

// Mobile responsiveness utilities and components for EventraiseHUB

// Responsive container with proper breakpoints
export interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-4 sm:px-6 lg:px-8 py-4',
    lg: 'px-6 sm:px-8 lg:px-12 py-6',
  }

  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

// Responsive grid with mobile-first approach
export interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const gridClasses = `grid ${gapClasses[gap]} ${
    cols.mobile ? `grid-cols-${cols.mobile}` : ''
  } ${
    cols.tablet ? `sm:grid-cols-${cols.tablet}` : ''
  } ${
    cols.desktop ? `lg:grid-cols-${cols.desktop}` : ''
  }`

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-friendly navigation
export interface MobileNavigationProps {
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}

export function MobileNavigation({
  isOpen,
  onToggle,
  children,
  className = '',
}: MobileNavigationProps) {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-label="Toggle navigation menu"
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} ${className}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
          {children}
        </div>
      </div>
    </>
  )
}

// Mobile-friendly form layout
export interface MobileFormProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function MobileForm({
  children,
  title,
  description,
  className = '',
}: MobileFormProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
          {description && (
            <p className="mt-2 text-sm text-gray-600 sm:text-base">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Mobile-friendly card
export interface MobileCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  clickable?: boolean
  onClick?: () => void
}

export function MobileCard({
  children,
  title,
  description,
  className = '',
  clickable = false,
  onClick,
}: MobileCardProps) {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6'
  const clickableClasses = clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''

  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Mobile-friendly button group
export interface MobileButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function MobileButtonGroup({
  children,
  orientation = 'horizontal',
  className = '',
}: MobileButtonGroupProps) {
  const orientationClasses = orientation === 'vertical' 
    ? 'flex-col space-y-2' 
    : 'flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2'

  return (
    <div className={`flex ${orientationClasses} ${className}`}>
      {children}
    </div>
  )
}

// Mobile-friendly table
export interface MobileTableProps {
  data: Array<Record<string, any>>
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  className?: string
}

export function MobileTable({ data, columns, className = '' }: MobileTableProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            {columns.map((column) => (
              <div key={column.key} className="mb-2 last:mb-0">
                <dt className="text-sm font-medium text-gray-500">{column.label}</dt>
                <dd className="text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </dd>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Mobile-friendly modal
export interface MobileModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: MobileModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${className}`}>
          {title && (
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
            </div>
          )}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile-friendly image
export interface MobileImageProps {
  src: string
  alt: string
  className?: string
  responsive?: boolean
  width?: number
  height?: number
}

export function MobileImage({
  src,
  alt,
  className = '',
  responsive = true,
  width,
  height,
}: MobileImageProps) {
  const responsiveClasses = responsive 
    ? 'w-full h-auto max-w-full' 
    : ''

  return (
    <Image
      src={src}
      alt={alt}
      className={`${responsiveClasses} ${className}`}
      loading="lazy"
      width={width || 800}
      height={height || 600}
    />
  )
}

// Mobile-friendly text
export interface MobileTextProps {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: 'gray' | 'blue' | 'green' | 'red' | 'yellow'
  className?: string
}

export function MobileText({
  children,
  size = 'base',
  weight = 'normal',
  color = 'gray',
  className = '',
}: MobileTextProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  const colorClasses = {
    gray: 'text-gray-900',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
  }

  return (
    <span className={`${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  )
}

// Mobile-friendly spacing
export interface MobileSpacingProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function MobileSpacing({
  children,
  padding = 'md',
  margin = 'none',
  className = '',
}: MobileSpacingProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12',
  }

  const marginClasses = {
    none: '',
    sm: 'm-2 sm:m-4',
    md: 'm-4 sm:m-6',
    lg: 'm-6 sm:m-8',
    xl: 'm-8 sm:m-12',
  }

  return (
    <div className={`${paddingClasses[padding]} ${marginClasses[margin]} ${className}`}>
      {children}
    </div>
  )
}

'use client'

import * as React from 'react'
import {
  CheckCircle,
  Globe,
  TrendingUp,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BentoItem {
  title: string
  description: string
  icon: React.ReactNode
  status?: string
  tags?: string[]
  meta?: string
  cta?: string
  colSpan?: number
  hasPersistentHover?: boolean
}

export interface BentoGridProps {
  items?: BentoItem[]
  className?: string
}

export const bentoSampleItems: BentoItem[] = [
  {
    title: 'Analytics Dashboard',
    meta: 'v2.4.1',
    description:
      'Real-time metrics with AI-powered insights and predictive analytics',
    icon: <TrendingUp className="h-4 w-4 text-blue-500" aria-hidden />,
    status: 'Live',
    tags: ['Statistics', 'Reports', 'AI'],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: 'Task Manager',
    meta: '84 completed',
    description: 'Automated workflow management with priority scheduling',
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden />,
    status: 'Updated',
    tags: ['Productivity', 'Automation'],
  },
  {
    title: 'Media Library',
    meta: '12GB used',
    description: 'Cloud storage with intelligent content processing',
    icon: <Video className="h-4 w-4 text-purple-500" aria-hidden />,
    tags: ['Storage', 'CDN'],
    colSpan: 2,
  },
  {
    title: 'Global Network',
    meta: '6 regions',
    description: 'Multi-region deployment with edge computing',
    icon: <Globe className="h-4 w-4 text-sky-500" aria-hidden />,
    status: 'Beta',
    tags: ['Infrastructure', 'Edge'],
  },
]

function BentoGrid({ items = bentoSampleItems, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'mx-auto grid max-w-7xl grid-cols-1 gap-3 p-4 md:grid-cols-3',
        className,
      )}
    >
      {items.map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className={cn(
            'group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300',
            'hover:-translate-y-0.5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] will-change-transform dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.04)]',
            item.colSpan === 2 && 'md:col-span-2',
            item.hasPersistentHover &&
              '-translate-y-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(255,255,255,0.04)]',
          )}
        >
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-300',
              item.hasPersistentHover
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100',
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:4px_4px] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
          </div>

          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 transition-all duration-300 group-hover:bg-gradient-to-br dark:bg-foreground/10">
                {item.icon}
              </div>
              <span
                className={cn(
                  'rounded-lg px-2 py-1 text-xs font-medium backdrop-blur-sm',
                  'bg-foreground/5 text-muted-foreground',
                  'transition-colors duration-300 group-hover:bg-foreground/10',
                )}
              >
                {item.status || 'Active'}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-[15px] font-medium tracking-tight text-foreground">
                {item.title}
                {item.meta && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </h3>
              <p className="text-sm leading-snug text-muted-foreground">
                {item.description}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-foreground/5 px-2 py-1 backdrop-blur-sm transition-all duration-200 hover:bg-foreground/10"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                {item.cta || 'Explore →'}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-transparent via-border/50 to-transparent p-px transition-opacity duration-300',
              item.hasPersistentHover
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100',
            )}
          />
        </div>
      ))}
    </div>
  )
}

export { BentoGrid }

'use client'

import Image from 'next/image'
import React from 'react'
import {
  Bookmark,
  Heart,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react'
import { SharePopoverDemo } from '@/components/ui/share-popover-demo'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

function QuickActionsDemo() {
  const actions = [
    { name: 'Add to Favorites', icon: Heart, color: 'text-red-600' },
    { name: 'Bookmark', icon: Bookmark, color: 'text-blue-600' },
    { name: 'Share event', icon: Share2, color: 'text-green-600' },
    { name: 'Delete', icon: Trash2, color: 'text-red-600' },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <MoreHorizontal className="mr-2 h-4 w-4" aria-hidden />
          Quick Actions
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <PopoverBody className="p-1">
          {actions.map((action, index) => (
            <React.Fragment key={action.name}>
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-full justify-start px-2"
                size="sm"
              >
                <action.icon
                  className={`mr-2 h-4 w-4 ${action.color}`}
                  aria-hidden
                />
                <span className="text-sm">{action.name}</span>
              </Button>
              {index === 2 && <Separator className="my-1" />}
            </React.Fragment>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default function PopoverDemoPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 bg-background p-6">
      <div className="absolute inset-0 -z-10 h-full max-h-md">
        <Image
          src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Popover</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Share menus, filters, and row actions on event pages and dashboards.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6">
        <SharePopoverDemo />
        <QuickActionsDemo />
      </div>
    </div>
  )
}

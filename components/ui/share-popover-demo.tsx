'use client'

import { Copy, Mail, MessageSquare, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

export type SharePopoverDemoProps = {
  shareUrl?: string
}

export function SharePopoverDemo({
  shareUrl = 'https://eventraisehub.com/events',
}: SharePopoverDemoProps) {
  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          void navigator.clipboard.writeText(
            typeof window !== 'undefined' ? window.location.href : shareUrl,
          )
        }
      },
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        if (typeof window !== 'undefined') {
          window.location.href = `mailto:?body=${encodeURIComponent(shareUrl)}`
        }
      },
    },
    { name: 'Message', icon: MessageSquare, action: () => undefined },
  ]

  const copyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" aria-hidden />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <PopoverHeader>
          <PopoverTitle>Share this item</PopoverTitle>
          <PopoverDescription>
            Choose how you want to share this event or campaign.
          </PopoverDescription>
        </PopoverHeader>
        <PopoverBody className="space-y-1 px-2 py-1">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              type="button"
              variant="ghost"
              className="w-full justify-start"
              size="sm"
              onClick={option.action}
            >
              <option.icon className="mr-2 h-4 w-4" aria-hidden />
              {option.name}
            </Button>
          ))}
        </PopoverBody>
        <PopoverFooter className="py-3">
          <Label htmlFor="share-url">Share URL</Label>
          <div className="flex space-x-2">
            <Input
              id="share-url"
              value={shareUrl}
              readOnly
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copyUrl}
              aria-label="Copy share URL"
            >
              <Copy className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  )
}

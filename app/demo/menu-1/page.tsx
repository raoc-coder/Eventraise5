'use client'

import Image from 'next/image'
import { JollyMenu, MenuItem } from '@/components/ui/menu-1'

export default function Menu1DemoPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-6">
      <div className="absolute inset-0 -z-10 opacity-20">
        <Image
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Accessible menu (React Aria)
        </h1>
        <p className="text-sm text-muted-foreground">
          Keyboard navigable · use on event rows, tables, or toolbars
        </p>
      </div>

      <JollyMenu variant="outline" label="Edit">
        <MenuItem>Cut</MenuItem>
        <MenuItem>Copy</MenuItem>
        <MenuItem>Paste</MenuItem>
        <MenuItem>Delete Item</MenuItem>
      </JollyMenu>
    </div>
  )
}

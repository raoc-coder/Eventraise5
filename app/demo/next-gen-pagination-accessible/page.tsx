'use client'

import Image from 'next/image'
import { PaginationDemo } from '@/components/ui/next-gen-pagination-accessible'

export default function NextGenPaginationDemoPage() {
  return (
    <div className="relative min-h-screen bg-background py-12">
      <div className="absolute inset-0 -z-10 h-64 opacity-20">
        <Image
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div className="mx-auto mb-8 max-w-4xl px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Accessible pagination
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use on events lists, donations tables, and admin reports.
        </p>
      </div>
      <PaginationDemo />
    </div>
  )
}

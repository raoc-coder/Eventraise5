'use client'

import Image from 'next/image'
import MemberList from '@/components/ui/member-list'

function MemberListDemo() {
  return (
    <div className="flex min-h-[480px] w-full items-center justify-center p-4">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border shadow-lg">
        <MemberList />
      </div>
    </div>
  )
}

export default function MemberListDemoPage() {
  return (
    <div className="relative min-h-screen bg-gray-100 py-12 dark:bg-gray-900">
      <div className="absolute inset-0 -z-10 h-80">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
      </div>
      <div className="mx-auto mb-8 max-w-4xl px-4 text-center">
        <h1 className="text-3xl font-bold text-foreground">Team members</h1>
        <p className="mt-2 text-muted-foreground">
          Member list with avatars, roles, join dates, and team tooltips.
        </p>
      </div>
      <MemberListDemo />
    </div>
  )
}

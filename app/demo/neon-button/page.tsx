'use client'

import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { Button as NeonButton } from '@/components/ui/neon-button'

function Default() {
  return (
    <div className="flex flex-col gap-3">
      <NeonButton>Button</NeonButton>
      <WithNoNeon />
      <Solid />
    </div>
  )
}

function WithNoNeon() {
  return (
    <div className="flex flex-col gap-2">
      <NeonButton neon={false}>normal button</NeonButton>
    </div>
  )
}

function Solid() {
  return (
    <div className="flex flex-col gap-2">
      <NeonButton variant="solid">solid</NeonButton>
    </div>
  )
}

export default function NeonButtonDemoPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80"
          alt="Abstract technology network lights"
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
      </div>

      <div className="mx-auto flex max-w-lg flex-col items-center gap-8 px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <span>Neon button demo</span>
        </div>
        <Default />
      </div>
    </div>
  )
}

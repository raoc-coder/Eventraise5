'use client'

import Image from 'next/image'
import { Sparkles, useSparklesColor } from '@/components/ui/sparkles'
import {
  Arc,
  Raycast,
  Remote,
  Retool,
  Vercel,
} from '@/components/ui/sparkles-demo-logos'

function SparklesDemo() {
  const sparklesColor = useSparklesColor()

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 -z-20">
        <Image
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto mt-32 w-full max-w-2xl px-4">
        <div className="text-center text-3xl text-foreground">
          <span className="text-indigo-900 dark:text-indigo-200">
            Trusted by experts.
          </span>
          <br />
          <span>Used by the leaders.</span>
        </div>

        <div className="mt-14 grid grid-cols-5 gap-4 text-zinc-900 dark:text-white">
          <Retool />
          <Vercel />
          <Remote />
          <Arc />
          <Raycast />
        </div>
      </div>

      <div className="relative -mt-32 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <div
          className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,var(--gradient-color),transparent_70%)] before:opacity-40"
          aria-hidden
        />
        <div className="absolute -left-1/2 top-1/2 z-10 aspect-[1/0.7] w-[200%] rounded-[100%] border-t border-zinc-900/20 bg-white dark:border-white/20 dark:bg-zinc-900" />
        <Sparkles
          density={1200}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
          color={sparklesColor}
        />
      </div>
    </div>
  )
}

export default function SparklesDemoPage() {
  return <SparklesDemo />
}

'use client'

import Image from 'next/image'
import { Footer } from '@/components/ui/footer-section'

export default function FooterSectionDemoPage() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div className="absolute inset-0 -z-10 h-[70vh]">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
      </div>

      <div className="flex min-h-screen flex-1 items-center justify-center px-6">
        <h1 className="font-mono text-2xl font-bold text-foreground">
          Scroll down!
        </h1>
      </div>

      <Footer />
    </div>
  )
}

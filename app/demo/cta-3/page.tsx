'use client'

import Image from 'next/image'
import { CallToAction } from '@/components/ui/cta-3'

export default function Cta3DemoPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
          alt="Team collaborating around a table"
          fill
          className="object-cover opacity-25"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <CallToAction
        title="Let your plans shape the future."
        description="Start your free trial today. No credit card required."
        primaryLabel="Get Started"
        secondaryLabel="Contact Sales"
        primaryHref="/auth/register"
        secondaryHref="/contact"
      />
    </div>
  )
}

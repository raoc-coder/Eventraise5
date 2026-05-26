'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRightIcon, Rocket } from 'lucide-react'
import { Banner } from '@/components/ui/banner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function BannerDemoPage() {
  const [show, setShow] = React.useState(true)

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 p-6">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-1/3 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full',
          'bg-[radial-gradient(ellipse_at_center,rgba(38,38,38,0.08),transparent_50%)]',
          'blur-[30px]',
        )}
      />

      <div className="relative z-10 w-full max-w-2xl space-y-4">
        <Banner
          show={show}
          onHide={() => setShow(false)}
          variant="default"
          title="AI Dashboard is here!"
          description="Experience the future of analytics"
          showShade
          closable
          icon={<Rocket className="h-5 w-5 text-primary" aria-hidden />}
          action={
            <Button
              type="button"
              onClick={() => setShow(false)}
              className="inline-flex items-center gap-1 rounded-md bg-black/10 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
              variant="ghost"
            >
              Try now
              <ArrowRightIcon className="h-3 w-3" aria-hidden />
            </Button>
          }
        />

        <Banner
          show
          variant="success"
          title="Registration complete"
          description="Your event is live and ready to share."
        />

        <Banner
          show
          variant="warning"
          title="Payout setup required"
          description="Connect PayPal to receive donations."
          closable
          onHide={() => undefined}
        />
      </div>

      <figure className="relative z-10 mt-4 h-48 w-full max-w-2xl overflow-hidden rounded-lg border shadow-md">
        <Image
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
          alt="People collaborating at an event planning workshop"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
          priority
        />
      </figure>

      {!show && (
        <Button type="button" onClick={() => setShow(true)} variant="outline">
          Show banner again
        </Button>
      )}
    </div>
  )
}

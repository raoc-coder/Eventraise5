import * as React from 'react'
import Link from 'next/link'
import { ArrowRightIcon, PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type CallToActionProps = {
  title?: string
  description?: string
  primaryLabel?: string
  secondaryLabel?: string
  primaryHref?: string
  secondaryHref?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  className?: string
}

export function CallToAction({
  title = 'Let your plans shape the future.',
  description = 'Start your free trial today. No credit card required.',
  primaryLabel = 'Get Started',
  secondaryLabel = 'Contact Sales',
  primaryHref = '/auth/register',
  secondaryHref = '/contact',
  onPrimaryClick,
  onSecondaryClick,
  className,
}: CallToActionProps) {
  const primaryContent = (
    <>
      {primaryLabel}
      <ArrowRightIcon className="ml-1 size-4" aria-hidden />
    </>
  )

  const primaryButton =
    primaryHref && !onPrimaryClick ? (
      <Button asChild>
        <Link href={primaryHref}>{primaryContent}</Link>
      </Button>
    ) : (
      <Button type="button" onClick={onPrimaryClick}>
        {primaryContent}
      </Button>
    )

  const secondaryButton =
    secondaryHref && !onSecondaryClick ? (
      <Button asChild variant="outline">
        <Link href={secondaryHref}>{secondaryLabel}</Link>
      </Button>
    ) : (
      <Button type="button" variant="outline" onClick={onSecondaryClick}>
        {secondaryLabel}
      </Button>
    )

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-6 border-y px-4 py-8',
        'bg-[radial-gradient(35%_80%_at_25%_0%,rgba(38,38,38,0.08),transparent)] dark:bg-[radial-gradient(35%_80%_at_25%_0%,rgba(229,229,229,0.08),transparent)]',
        className,
      )}
    >
      <PlusIcon
        className="absolute left-[-11.5px] top-[-12.5px] z-[1] size-6 text-border"
        strokeWidth={1}
        aria-hidden
      />
      <PlusIcon
        className="absolute right-[-11.5px] top-[-12.5px] z-[1] size-6 text-border"
        strokeWidth={1}
        aria-hidden
      />
      <PlusIcon
        className="absolute bottom-[-12.5px] left-[-11.5px] z-[1] size-6 text-border"
        strokeWidth={1}
        aria-hidden
      />
      <PlusIcon
        className="absolute bottom-[-12.5px] right-[-11.5px] z-[1] size-6 text-border"
        strokeWidth={1}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -inset-y-6 left-0 w-px border-l border-border"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-y-6 right-0 w-px border-r border-border"
        aria-hidden
      />

      <div
        className="absolute top-0 left-1/2 -z-10 h-full border-l border-dashed border-border"
        aria-hidden
      />

      <div className="space-y-1">
        <h2 className="text-center text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-center text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        {secondaryButton}
        {primaryButton}
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings2, Sparkles, Zap, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FeatureItem = {
  title: string
  description: string
  icon: LucideIcon
}

export type FeaturesProps = {
  heading?: string
  subheading?: string
  items?: FeatureItem[]
  className?: string
}

const defaultItems: FeatureItem[] = [
  {
    title: 'Customizable',
    icon: Zap,
    description:
      'Extensive customization options, allowing you to tailor every aspect to meet your specific needs.',
  },
  {
    title: 'You have full control',
    icon: Settings2,
    description:
      'From design elements to functionality, you have complete control to create a unique and personalized experience.',
  },
  {
    title: 'Powered By AI',
    icon: Sparkles,
    description:
      'Elements to functionality, you have complete control to create a unique experience.',
  },
]

export function Features({
  heading = 'Built to cover your needs',
  subheading = 'Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.',
  items = defaultItems,
  className,
}: FeaturesProps) {
  return (
    <section className={cn('py-16 md:py-32', className)}>
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold text-foreground lg:text-5xl">
            {heading}
          </h2>
          <p className="mt-4 text-muted-foreground">{subheading}</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-sm gap-6 *:text-center @lg:grid-cols-3 @lg:max-w-none md:mt-16">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.title}
                className="group border-0 bg-muted shadow-none"
              >
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <Icon className="size-6 text-primary" aria-hidden />
                  </CardDecorator>
                  <h3 className="mt-6 font-medium text-foreground">{item.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CardDecorator({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 [--border:black] dark:[--border:white]" />
      <div className="absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t border-border bg-background">
        {children}
      </div>
    </div>
  )
}

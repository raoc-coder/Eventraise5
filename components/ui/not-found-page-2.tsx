'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

const PRIMARY_ORB_HORIZONTAL_OFFSET = 40
const PRIMARY_ORB_VERTICAL_OFFSET = 20

export type NotFoundPageProps = {
  homeHref?: string
  exploreHref?: string
  className?: string
}

export function NotFoundPage({
  homeHref = '/',
  exploreHref = '/events',
  className,
}: NotFoundPageProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground',
        'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_70%)]',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-20 opacity-30">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {!shouldReduceMotion && (
          <>
            <motion.div
              animate={{
                x: [
                  0,
                  PRIMARY_ORB_HORIZONTAL_OFFSET,
                  -PRIMARY_ORB_HORIZONTAL_OFFSET,
                  0,
                ],
                y: [
                  0,
                  PRIMARY_ORB_VERTICAL_OFFSET,
                  -PRIMARY_ORB_VERTICAL_OFFSET,
                  0,
                ],
                rotate: [0, 10, -10, 0],
              }}
              className="absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/25 to-trust-500/20 blur-3xl"
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              animate={{
                x: [
                  0,
                  -PRIMARY_ORB_HORIZONTAL_OFFSET,
                  PRIMARY_ORB_HORIZONTAL_OFFSET,
                  0,
                ],
                y: [
                  0,
                  -PRIMARY_ORB_VERTICAL_OFFSET,
                  PRIMARY_ORB_VERTICAL_OFFSET,
                  0,
                ],
              }}
              className="absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full bg-gradient-to-br from-action-500/15 to-primary/10 blur-3xl"
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5,
                ease: 'easeInOut',
              }}
            />
          </>
        )}
      </div>

      <Empty>
        <EmptyHeader>
          <EmptyTitle className="text-8xl font-extrabold">404</EmptyTitle>
          <EmptyDescription className="text-balance sm:text-nowrap">
            The page you&apos;re looking for might have been <br />
            moved or doesn&apos;t exist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href={homeHref}>
                <Home className="mr-2 h-4 w-4" aria-hidden />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={exploreHref}>
                <Compass className="mr-2 h-4 w-4" aria-hidden />
                Explore Events
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  )
}

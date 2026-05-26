'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  FacebookIcon,
  FrameIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FooterLink {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  external?: boolean
}

export interface FooterSection {
  label: string
  links: FooterLink[]
}

export type FooterSectionProps = {
  sections?: FooterSection[]
  brandName?: string
  logoSrc?: string
  className?: string
}

const defaultFooterLinks: FooterSection[] = [
  {
    label: 'Product',
    links: [
      { title: 'Features', href: '/getting-started' },
      { title: 'Pricing', href: '/pricing' },
      { title: 'Events', href: '/events' },
      { title: 'Marketplace', href: '/marketplace' },
    ],
  },
  {
    label: 'Company',
    links: [
      { title: 'FAQs', href: '/faqs' },
      { title: 'Contact', href: '/contact' },
      { title: 'Privacy Policy', href: '/legal/privacy' },
      { title: 'Terms of Service', href: '/legal/terms' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Getting Started', href: '/getting-started' },
      { title: 'Volunteers', href: '/volunteers' },
      { title: 'Donations', href: '/donations' },
      { title: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    label: 'Social Links',
    links: [
      {
        title: 'Facebook',
        href: 'https://www.facebook.com/profile.php?id=61584525567671',
        icon: FacebookIcon,
        external: true,
      },
      {
        title: 'Instagram',
        href: 'https://www.instagram.com/eventraisehub/',
        icon: InstagramIcon,
        external: true,
      },
      { title: 'Youtube', href: '#', icon: YoutubeIcon, external: true },
      { title: 'LinkedIn', href: '#', icon: LinkedinIcon, external: true },
    ],
  },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className =
    'inline-flex items-center transition-all duration-300 hover:text-foreground'
  const content = (
    <>
      {link.icon && <link.icon className="me-1 size-4" aria-hidden />}
      {link.title}
    </>
  )

  if (link.external || link.href.startsWith('http')) {
    return (
      <a
        href={link.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  )
}

export function FooterSection({
  sections = defaultFooterLinks,
  brandName = 'EventraiseHub',
  logoSrc = '/brand/ERBlogo.png',
  className,
}: FooterSectionProps) {
  return (
    <footer
      className={cn(
        'relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center rounded-t-3xl border-t px-6 py-12 md:rounded-t-[2.5rem] lg:py-16',
        'bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.08),transparent)] dark:bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.06),transparent)]',
        className,
      )}
    >
      <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/20 blur" />

      <div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
        <AnimatedContainer className="space-y-4">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={brandName}
              width={32}
              height={32}
              className="size-8 object-contain"
            />
          ) : (
            <FrameIcon className="size-8 text-primary" aria-hidden />
          )}
          <p className="mt-8 text-sm text-muted-foreground md:mt-0">
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>
        </AnimatedContainer>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
          {sections.map((section, index) => (
            <AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
              <div className="mb-10 md:mb-0">
                <h3 className="text-xs font-medium uppercase tracking-wide text-foreground">
                  {section.label}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </footer>
  )
}

/** Alias for demo / block imports */
export const Footer = FooterSection

type ViewAnimationProps = {
  delay?: number
  className?: ComponentProps<typeof motion.div>['className']
  children: ReactNode
}

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

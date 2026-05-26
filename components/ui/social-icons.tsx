'use client'

import * as React from 'react'
import { useState } from 'react'
import { Facebook, Github, Instagram, Linkedin } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SocialLink = {
  name: string
  href: string
  icon: React.ReactNode
}

const DribbbleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden>
    <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z" />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-[18px]" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export const defaultSocialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61584525567671',
    icon: <Facebook className="size-[18px]" />,
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/eventraisehub/',
    icon: <Instagram className="size-[18px]" />,
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: <Github className="size-[18px]" />,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: <Linkedin className="size-[18px]" />,
  },
]

/** Original demo set (GitHub, X, LinkedIn, Dribbble) */
export const creatorSocialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: <Github className="size-[18px]" />,
  },
  {
    name: 'X',
    href: 'https://x.com',
    icon: <XIcon />,
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: <Linkedin className="size-[18px]" />,
  },
  {
    name: 'Dribbble',
    href: 'https://dribbble.com',
    icon: <DribbbleIcon />,
  },
]

export type SocialIconsProps = {
  items?: SocialLink[]
  className?: string
}

export function SocialIcons({
  items = defaultSocialLinks,
  className,
}: SocialIconsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div
      className={cn(
        'relative flex items-center gap-0.5 rounded-2xl border border-white/[0.08] bg-neutral-950 px-1.5 py-1.5',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent" />

      {items.map((social, index) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex size-10 items-center justify-center rounded-xl transition-colors duration-200"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onFocus={() => setHoveredIndex(index)}
          onBlur={() => setHoveredIndex(null)}
          aria-label={social.name}
        >
          <span
            className={cn(
              'absolute inset-1 scale-90 rounded-lg bg-white/[0.08] opacity-0 transition-all duration-300 ease-out',
              hoveredIndex === index && 'scale-100 opacity-100',
            )}
          />

          <span
            className={cn(
              'relative z-10 transition-all duration-300 ease-out',
              hoveredIndex === index
                ? 'scale-110 text-white'
                : 'text-neutral-500',
            )}
          >
            {social.icon}
          </span>

          <span
            className={cn(
              'absolute bottom-1.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-white transition-all duration-300 ease-out',
              hoveredIndex === index ? 'w-3 opacity-100' : 'w-0 opacity-0',
            )}
          />

          <span
            className={cn(
              'absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-950 transition-all duration-300 ease-out',
              hoveredIndex === index
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-1 opacity-0',
            )}
          >
            {social.name}
            <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-white" />
          </span>
        </a>
      ))}
    </div>
  )
}

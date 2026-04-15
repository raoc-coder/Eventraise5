'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
    }
  }
}

type TurnstileCaptchaProps = {
  onTokenChange: (token: string | null) => void
  resetSignal?: number
}

export function TurnstileCaptcha({ onTokenChange, resetSignal = 0 }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenChange(token),
        'expired-callback': () => onTokenChange(null),
        'error-callback': () => onTokenChange(null),
      })
    }

    if (window.turnstile) {
      renderWidget()
      return () => {
        cancelled = true
      }
    }

    const scriptId = 'cf-turnstile-script'
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', renderWidget)
      return () => {
        cancelled = true
        existing.removeEventListener('load', renderWidget)
      }
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.addEventListener('load', renderWidget)
    document.head.appendChild(script)

    return () => {
      cancelled = true
      script.removeEventListener('load', renderWidget)
    }
  }, [onTokenChange, siteKey])

  useEffect(() => {
    if (!window.turnstile || !widgetIdRef.current) return
    window.turnstile.reset(widgetIdRef.current)
    onTokenChange(null)
  }, [onTokenChange, resetSignal])

  if (!siteKey) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Complete verification to continue.</p>
      <div ref={containerRef} />
    </div>
  )
}

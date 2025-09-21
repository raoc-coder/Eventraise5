import * as Sentry from '@sentry/nextjs'

export async function register() {
  await import('./sentry.client.config')
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

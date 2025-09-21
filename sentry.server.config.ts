import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'server'
    }
  },
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out non-critical server errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Filter out expected errors
        if (error.message.includes('ENOTFOUND') || 
            error.message.includes('ECONNREFUSED')) {
          return null
        }
      }
    }
    return event
  },
})

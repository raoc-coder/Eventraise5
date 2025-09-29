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
      component: 'server',
      platform: 'node',
      app: 'eventraisehub'
    }
  },
  
  // Enhanced error filtering
  beforeSend(event, hint) {
    // Filter out non-critical server errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Filter out expected errors
        if (error.message.includes('ENOTFOUND') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ETIMEDOUT')) {
          return null
        }
        
        // Filter out validation errors that are handled
        if (error.message.includes('validation') && 
            error.message.includes('required')) {
          return null
        }
      }
    }
    
    // Add server context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'node',
        version: process.version
      },
      os: {
        name: process.platform,
        version: process.arch
      }
    }
    
    return event
  },
  
  // Custom performance monitoring
  beforeSendTransaction(event) {
    // Track API performance
    if (event.transaction) {
      if (event.transaction.includes('/api/')) {
        event.tags = {
          ...event.tags,
          endpoint_type: 'api'
        }
        
        // Track critical endpoints
        if (event.transaction.includes('/api/create-checkout') ||
            false ||
            event.transaction.includes('/api/events/register')) {
          event.tags = {
            ...event.tags,
            critical_endpoint: true
          }
        }
      }
    }
    return event
  },
})

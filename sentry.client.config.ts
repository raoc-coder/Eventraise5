import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'client',
      platform: 'web',
      app: 'eventraisehub'
    }
  },
  
  // Enhanced error filtering
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Filter out network errors that are not critical
        if (error.message.includes('NetworkError') && 
            !error.message.includes('payment') && 
            !error.message.includes('donation')) {
          return null
        }
        
        // Filter out common browser errors
        if (error.message.includes('ResizeObserver loop limit exceeded') ||
            error.message.includes('Non-Error promise rejection')) {
          return null
        }
      }
    }
    
    // Add custom context
    event.contexts = {
      ...event.contexts,
      runtime: {
        name: 'browser',
        version: navigator.userAgent
      }
    }
    
    return event
  },
  
  // Integration configuration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Custom performance monitoring
  beforeSendTransaction(event) {
    // Track custom performance metrics
    if (event.transaction) {
      // Track page load times
      if (event.transaction.includes('/campaigns/') || 
          event.transaction.includes('/events/') ||
          event.transaction.includes('/admin/')) {
        event.tags = {
          ...event.tags,
          page_type: 'content_page'
        }
      }
    }
    return event
  },
})

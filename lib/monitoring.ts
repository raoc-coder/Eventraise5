import * as Sentry from '@sentry/nextjs'

// Error monitoring and alerting
export class MonitoringService {
  // Critical error tracking
  static trackCriticalError(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setLevel('error')
      scope.setTag('error_type', 'critical')
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      Sentry.captureException(error)
    })
  }

  // Payment error tracking
  static trackPaymentError(error: Error, paymentContext: {
    campaignId: string
    amount: number
    donorEmail?: string
    processor?: 'braintree'
  }) {
    Sentry.withScope((scope) => {
      scope.setLevel('error')
      scope.setTag('error_type', 'payment')
      scope.setContext('payment', paymentContext)
      Sentry.captureException(error)
    })
  }

  // Database error tracking
  static trackDatabaseError(error: Error, operation: string, table?: string) {
    Sentry.withScope((scope) => {
      scope.setLevel('error')
      scope.setTag('error_type', 'database')
      scope.setContext('database', {
        operation,
        table,
      })
      Sentry.captureException(error)
    })
  }

  // Authentication error tracking
  static trackAuthError(error: Error, userId?: string, action?: string) {
    Sentry.withScope((scope) => {
      scope.setLevel('warning')
      scope.setTag('error_type', 'authentication')
      scope.setContext('auth', {
        user_id: userId,
        action,
      })
      Sentry.captureException(error)
    })
  }

  // Performance monitoring
  static trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Performance: ${operation}`,
      level: 'info',
      data: {
        duration,
        ...metadata,
      },
    })
  }

  // Business metrics tracking
  static trackBusinessMetric(metric: string, value: number, context?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Business Metric: ${metric}`,
      level: 'info',
      data: {
        metric,
        value,
        ...context,
      },
    })
  }

  // Custom alert for critical business events
  static alertCriticalEvent(event: string, data: Record<string, any>) {
    Sentry.withScope((scope) => {
      scope.setLevel('fatal')
      scope.setTag('alert_type', 'critical_business_event')
      scope.setContext('event', {
        event_name: event,
        ...data,
      })
      Sentry.captureMessage(`Critical Business Event: ${event}`)
    })
  }
}

// Database monitoring utilities
export class DatabaseMonitoring {
  static async trackQueryPerformance<T>(
    operation: string,
    query: () => Promise<T>,
    table?: string
  ): Promise<T> {
    const startTime = Date.now()
    try {
      const result = await query()
      const duration = Date.now() - startTime
      
      MonitoringService.trackPerformance(operation, duration, { table })
      
      // Alert on slow queries
      if (duration > 5000) { // 5 seconds
        MonitoringService.trackCriticalError(
          new Error(`Slow database query: ${operation}`),
          { duration, table }
        )
      }
      
      return result
    } catch (error) {
      MonitoringService.trackDatabaseError(
        error as Error,
        operation,
        table
      )
      throw error
    }
  }
}

// Health check utilities
export class HealthCheck {
  static async checkDatabase(): Promise<boolean> {
    try {
      const { supabase } = await import('@/lib/supabase')
      if (!supabase) {
        return false
      }
      const { error } = await supabase.from('profiles').select('count').limit(1)
      return !error
    } catch (error) {
      MonitoringService.trackCriticalError(error as Error, { component: 'database' })
      return false
    }
  }

  // Stripe check removed (migrated to Braintree)

  static async checkSupabaseAuth(): Promise<boolean> {
    try {
      const { supabase } = await import('@/lib/supabase')
      if (!supabase) {
        return false
      }
      const { error } = await supabase.auth.getSession()
      return !error
    } catch (error) {
      MonitoringService.trackCriticalError(error as Error, { component: 'auth' })
      return false
    }
  }

  static async runFullHealthCheck(): Promise<{
    database: boolean
    auth: boolean
    overall: boolean
  }> {
    const [database, auth] = await Promise.all([
      this.checkDatabase(),
      this.checkSupabaseAuth(),
    ])

    const overall = database && auth

    if (!overall) {
      MonitoringService.alertCriticalEvent('health_check_failed', {
        database,
        auth,
      })
    }

    return { database, auth, overall }
  }
}

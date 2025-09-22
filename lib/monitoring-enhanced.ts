import * as Sentry from '@sentry/nextjs'

// Enhanced monitoring service for EventraiseHUB
export class MonitoringService {
  // Track business metrics
  static trackBusinessMetric(metric: string, value: number, tags?: Record<string, string>) {
    Sentry.addBreadcrumb({
      message: `Business metric: ${metric}`,
      category: 'business',
      data: { value, tags },
      level: 'info'
    })
    
    Sentry.setContext('business_metrics', {
      [metric]: value,
      ...tags
    })
  }

  // Track user actions
  static trackUserAction(action: string, userId?: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      category: 'user_action',
      data: { userId, metadata },
      level: 'info'
    })
    
    Sentry.setUser({
      id: userId,
      action: action
    })
  }

  // Track performance metrics
  static trackPerformance(metric: string, value: number, unit: string = 'ms') {
    Sentry.addBreadcrumb({
      message: `Performance: ${metric}`,
      category: 'performance',
      data: { value, unit },
      level: 'info'
    })
    
    Sentry.setContext('performance_metrics', {
      [metric]: { value, unit }
    })
  }

  // Track donation events
  static trackDonation(donationData: {
    amount: number
    campaignId: string
    donorEmail?: string
    isAnonymous: boolean
  }) {
    Sentry.addBreadcrumb({
      message: 'Donation completed',
      category: 'donation',
      data: donationData,
      level: 'info'
    })
    
    this.trackBusinessMetric('donation_amount', donationData.amount, {
      campaign_id: donationData.campaignId,
      anonymous: donationData.isAnonymous.toString()
    })
  }

  // Track event registration
  static trackEventRegistration(registrationData: {
    eventId: string
    participantCount: number
    totalAmount: number
  }) {
    Sentry.addBreadcrumb({
      message: 'Event registration completed',
      category: 'event_registration',
      data: registrationData,
      level: 'info'
    })
    
    this.trackBusinessMetric('event_registration', registrationData.participantCount, {
      event_id: registrationData.eventId
    })
    
    this.trackBusinessMetric('event_revenue', registrationData.totalAmount, {
      event_id: registrationData.eventId
    })
  }

  // Track volunteer signup
  static trackVolunteerSignup(signupData: {
    shiftId: string
    eventId: string
    volunteerEmail: string
  }) {
    Sentry.addBreadcrumb({
      message: 'Volunteer signup completed',
      category: 'volunteer_signup',
      data: signupData,
      level: 'info'
    })
    
    this.trackBusinessMetric('volunteer_signup', 1, {
      shift_id: signupData.shiftId,
      event_id: signupData.eventId
    })
  }

  // Track critical errors
  static trackCriticalError(error: Error, context?: Record<string, any>) {
    Sentry.captureException(error, {
      tags: {
        severity: 'critical',
        component: 'business_logic'
      },
      extra: context
    })
  }

  // Track payment errors
  static trackPaymentError(error: Error, paymentData?: Record<string, any>) {
    Sentry.captureException(error, {
      tags: {
        severity: 'high',
        component: 'payment',
        error_type: 'payment_failure'
      },
      extra: paymentData
    })
  }

  // Track API performance
  static trackAPIPerformance(endpoint: string, duration: number, statusCode: number) {
    this.trackPerformance(`api_${endpoint}`, duration)
    
    if (statusCode >= 400) {
      Sentry.addBreadcrumb({
        message: `API error: ${endpoint}`,
        category: 'api_error',
        data: { endpoint, statusCode, duration },
        level: 'error'
      })
    }
  }

  // Track page performance
  static trackPagePerformance(page: string, metrics: {
    loadTime: number
    firstContentfulPaint?: number
    largestContentfulPaint?: number
    cumulativeLayoutShift?: number
  }) {
    this.trackPerformance(`page_${page}_load`, metrics.loadTime)
    
    if (metrics.firstContentfulPaint) {
      this.trackPerformance(`page_${page}_fcp`, metrics.firstContentfulPaint)
    }
    
    if (metrics.largestContentfulPaint) {
      this.trackPerformance(`page_${page}_lcp`, metrics.largestContentfulPaint)
    }
    
    if (metrics.cumulativeLayoutShift) {
      this.trackPerformance(`page_${page}_cls`, metrics.cumulativeLayoutShift)
    }
  }

  // Track user session
  static trackUserSession(sessionData: {
    userId?: string
    sessionId: string
    startTime: Date
    userAgent: string
    referrer?: string
  }) {
    Sentry.setUser({
      id: sessionData.userId,
      sessionId: sessionData.sessionId
    })
    
    Sentry.setContext('session', {
      startTime: sessionData.startTime.toISOString(),
      userAgent: sessionData.userAgent,
      referrer: sessionData.referrer
    })
  }

  // Track feature usage
  static trackFeatureUsage(feature: string, userId?: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Feature used: ${feature}`,
      category: 'feature_usage',
      data: { userId, metadata },
      level: 'info'
    })
    
    this.trackBusinessMetric('feature_usage', 1, {
      feature,
      user_id: userId || 'anonymous'
    })
  }

  // Track conversion funnel
  static trackConversionFunnel(step: string, userId?: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Conversion step: ${step}`,
      category: 'conversion',
      data: { userId, metadata },
      level: 'info'
    })
    
    this.trackBusinessMetric('conversion_funnel', 1, {
      step,
      user_id: userId || 'anonymous'
    })
  }

  // Track system health
  static trackSystemHealth(healthData: {
    database: boolean
    stripe: boolean
    sendgrid: boolean
    supabase: boolean
  }) {
    const healthyServices = Object.values(healthData).filter(Boolean).length
    const totalServices = Object.keys(healthData).length
    
    this.trackBusinessMetric('system_health', (healthyServices / totalServices) * 100, {
      healthy_services: healthyServices.toString(),
      total_services: totalServices.toString()
    })
    
    if (healthyServices < totalServices) {
      Sentry.addBreadcrumb({
        message: 'System health degraded',
        category: 'system_health',
        data: healthData,
        level: 'warning'
      })
    }
  }

  // Track security events
  static trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Security event: ${event}`,
      category: 'security',
      data: { severity, ...data },
      level: severity === 'critical' ? 'error' : 'warning'
    })
    
    Sentry.setTag('security_event', event)
    Sentry.setTag('security_severity', severity)
  }

  // Track A/B test results
  static trackABTest(testName: string, variant: string, userId?: string, result?: any) {
    Sentry.addBreadcrumb({
      message: `A/B test: ${testName}`,
      category: 'ab_test',
      data: { variant, userId, result },
      level: 'info'
    })
    
    this.trackBusinessMetric('ab_test', 1, {
      test_name: testName,
      variant,
      user_id: userId || 'anonymous'
    })
  }

  // Set user context
  static setUserContext(user: {
    id: string
    email?: string
    role?: string
    organization?: string
  }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role
    })
    
    Sentry.setContext('user', {
      organization: user.organization
    })
  }

  // Clear user context
  static clearUserContext() {
    Sentry.setUser(null)
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  static startTimer(name: string): void {
    this.timers.set(name, performance.now())
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Timer ${name} was not started`)
      return 0
    }
    
    const duration = performance.now() - startTime
    this.timers.delete(name)
    
    MonitoringService.trackPerformance(name, duration)
    return duration
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name)
    return fn().finally(() => {
      this.endTimer(name)
    })
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name)
    const result = fn()
    this.endTimer(name)
    return result
  }
}

// Health check service
export class HealthCheckService {
  static async checkDatabase(): Promise<boolean> {
    try {
      // This would be implemented based on your database setup
      return true
    } catch (error) {
      MonitoringService.trackCriticalError(error as Error, { component: 'database' })
      return false
    }
  }

  static async checkStripe(): Promise<boolean> {
    try {
      // This would check Stripe API connectivity
      return true
    } catch (error) {
      MonitoringService.trackCriticalError(error as Error, { component: 'stripe' })
      return false
    }
  }

  static async checkSendGrid(): Promise<boolean> {
    try {
      // This would check SendGrid API connectivity
      return true
    } catch (error) {
      MonitoringService.trackCriticalError(error as Error, { component: 'sendgrid' })
      return false
    }
  }

  static async checkSupabase(): Promise<boolean> {
    try {
      // This would check Supabase connectivity
      return true
    } catch (error) {
      MonitoringService.trackCriticalError(error as Error, { component: 'supabase' })
      return false
    }
  }

  static async runHealthCheck(): Promise<{
    database: boolean
    stripe: boolean
    sendgrid: boolean
    supabase: boolean
    overall: boolean
  }> {
    const [database, stripe, sendgrid, supabase] = await Promise.all([
      this.checkDatabase(),
      this.checkStripe(),
      this.checkSendGrid(),
      this.checkSupabase()
    ])

    const overall = database && stripe && sendgrid && supabase

    MonitoringService.trackSystemHealth({
      database,
      stripe,
      sendgrid,
      supabase
    })

    return {
      database,
      stripe,
      sendgrid,
      supabase,
      overall
    }
  }
}

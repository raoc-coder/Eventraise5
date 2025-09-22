// Enhanced analytics service for EventraiseHUB
import { MonitoringService } from './monitoring-enhanced'

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

// Analytics configuration
export const ANALYTICS_CONFIG = {
  // PostHog configuration
  posthog: {
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capturePageview: true,
    capturePageleave: true,
    loaded: (posthog: any) => {
      // Configure PostHog
      posthog.register({
        app_name: 'EventraiseHUB',
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        platform: 'web'
      })
    }
  },
  
  // Google Analytics configuration
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    debug: process.env.NODE_ENV === 'development'
  },
  
  // Custom analytics events
  events: {
    // User events
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    
    // Campaign events
    CAMPAIGN_VIEW: 'campaign_view',
    CAMPAIGN_CREATE: 'campaign_create',
    CAMPAIGN_EDIT: 'campaign_edit',
    CAMPAIGN_DELETE: 'campaign_delete',
    
    // Donation events
    DONATION_START: 'donation_start',
    DONATION_COMPLETE: 'donation_complete',
    DONATION_FAIL: 'donation_fail',
    DONATION_REFUND: 'donation_refund',
    
    // Event events
    EVENT_VIEW: 'event_view',
    EVENT_CREATE: 'event_create',
    EVENT_REGISTER: 'event_register',
    EVENT_REGISTRATION_COMPLETE: 'event_registration_complete',
    
    // Volunteer events
    VOLUNTEER_VIEW: 'volunteer_view',
    VOLUNTEER_SIGNUP: 'volunteer_signup',
    VOLUNTEER_SIGNUP_COMPLETE: 'volunteer_signup_complete',
    
    // Admin events
    ADMIN_LOGIN: 'admin_login',
    ADMIN_REPORT_VIEW: 'admin_report_view',
    ADMIN_EXPORT: 'admin_export',
    
    // System events
    ERROR_OCCURRED: 'error_occurred',
    PERFORMANCE_ISSUE: 'performance_issue',
    SECURITY_EVENT: 'security_event'
  }
}

// Enhanced analytics service
export class AnalyticsService {
  private static posthog: any = null
  private static gtag: any = null

  // Initialize analytics
  static async initialize() {
    // Initialize PostHog
    if (typeof window !== 'undefined' && ANALYTICS_CONFIG.posthog.apiKey) {
      const { default: PostHog } = await import('posthog-js')
      PostHog.init(ANALYTICS_CONFIG.posthog.apiKey, {
        api_host: ANALYTICS_CONFIG.posthog.host,
        capture_pageview: ANALYTICS_CONFIG.posthog.capturePageview,
        capture_pageleave: ANALYTICS_CONFIG.posthog.capturePageleave,
        loaded: ANALYTICS_CONFIG.posthog.loaded
      })
      this.posthog = PostHog
    }

    // Initialize Google Analytics
    if (typeof window !== 'undefined' && ANALYTICS_CONFIG.googleAnalytics.measurementId) {
      // Load gtag script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalytics.measurementId}`
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      this.gtag = function(...args: any[]) {
        window.dataLayer.push(args)
      }
      this.gtag('js', new Date())
      this.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
        debug_mode: ANALYTICS_CONFIG.googleAnalytics.debug
      })
    }
  }

  // Track custom events
  static track(event: string, properties?: Record<string, any>, userId?: string) {
    // Track in PostHog
    if (this.posthog) {
      this.posthog.capture(event, {
        ...properties,
        timestamp: new Date().toISOString(),
        user_id: userId
      })
    }

    // Track in Google Analytics
    if (this.gtag) {
      this.gtag('event', event, {
        event_category: 'custom',
        event_label: properties?.label || event,
        value: properties?.value || 1,
        custom_parameters: properties
      })
    }

    // Track in Sentry
    MonitoringService.trackUserAction(event, userId, properties)
  }

  // Track page views
  static trackPageView(page: string, properties?: Record<string, any>) {
    // Track in PostHog
    if (this.posthog) {
      this.posthog.capture('$pageview', {
        $current_url: page,
        ...properties
      })
    }

    // Track in Google Analytics
    if (this.gtag) {
      this.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
        page_path: page,
        ...properties
      })
    }

    // Track in Sentry
    MonitoringService.trackUserAction('page_view', undefined, { page, ...properties })
  }

  // Track user identification
  static identify(userId: string, properties?: Record<string, any>) {
    // Track in PostHog
    if (this.posthog) {
      this.posthog.identify(userId, properties)
    }

    // Track in Google Analytics
    if (this.gtag) {
      this.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
        user_id: userId,
        custom_map: properties
      })
    }

    // Track in Sentry
    MonitoringService.setUserContext({
      id: userId,
      ...properties
    })
  }

  // Track donation events
  static trackDonation(donationData: {
    amount: number
    campaignId: string
    donorEmail?: string
    isAnonymous: boolean
    paymentMethod?: string
  }) {
    this.track(ANALYTICS_CONFIG.events.DONATION_COMPLETE, {
      amount: donationData.amount,
      campaign_id: donationData.campaignId,
      anonymous: donationData.isAnonymous,
      payment_method: donationData.paymentMethod,
      currency: 'USD'
    })

    // Track in Sentry
    MonitoringService.trackDonation(donationData)
  }

  // Track event registration
  static trackEventRegistration(registrationData: {
    eventId: string
    participantCount: number
    totalAmount: number
    ticketType?: string
  }) {
    this.track(ANALYTICS_CONFIG.events.EVENT_REGISTRATION_COMPLETE, {
      event_id: registrationData.eventId,
      participant_count: registrationData.participantCount,
      total_amount: registrationData.totalAmount,
      ticket_type: registrationData.ticketType
    })

    // Track in Sentry
    MonitoringService.trackEventRegistration(registrationData)
  }

  // Track volunteer signup
  static trackVolunteerSignup(signupData: {
    shiftId: string
    eventId: string
    volunteerEmail: string
    skills?: string[]
  }) {
    this.track(ANALYTICS_CONFIG.events.VOLUNTEER_SIGNUP_COMPLETE, {
      shift_id: signupData.shiftId,
      event_id: signupData.eventId,
      skills: signupData.skills
    })

    // Track in Sentry
    MonitoringService.trackVolunteerSignup(signupData)
  }

  // Track conversion funnel
  static trackConversionFunnel(step: string, userId?: string, metadata?: Record<string, any>) {
    this.track('conversion_funnel', {
      step,
      ...metadata
    }, userId)

    // Track in Sentry
    MonitoringService.trackConversionFunnel(step, userId, metadata)
  }

  // Track feature usage
  static trackFeatureUsage(feature: string, userId?: string, metadata?: Record<string, any>) {
    this.track('feature_usage', {
      feature,
      ...metadata
    }, userId)

    // Track in Sentry
    MonitoringService.trackFeatureUsage(feature, userId, metadata)
  }

  // Track errors
  static trackError(error: Error, context?: Record<string, any>) {
    this.track(ANALYTICS_CONFIG.events.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    })

    // Track in Sentry
    MonitoringService.trackCriticalError(error, context)
  }

  // Track performance issues
  static trackPerformanceIssue(metric: string, value: number, threshold: number) {
    this.track(ANALYTICS_CONFIG.events.PERFORMANCE_ISSUE, {
      metric,
      value,
      threshold,
      severity: value > threshold * 2 ? 'high' : 'medium'
    })

    // Track in Sentry
    MonitoringService.trackPerformance(metric, value)
  }

  // Track A/B test results
  static trackABTest(testName: string, variant: string, userId?: string, result?: any) {
    this.track('ab_test', {
      test_name: testName,
      variant,
      result
    }, userId)

    // Track in Sentry
    MonitoringService.trackABTest(testName, variant, userId, result)
  }

  // Track security events
  static trackSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', data?: Record<string, any>) {
    this.track(ANALYTICS_CONFIG.events.SECURITY_EVENT, {
      event,
      severity,
      ...data
    })

    // Track in Sentry
    MonitoringService.trackSecurityEvent(event, severity, data)
  }

  // Track business metrics
  static trackBusinessMetric(metric: string, value: number, tags?: Record<string, string>) {
    this.track('business_metric', {
      metric,
      value,
      ...tags
    })

    // Track in Sentry
    MonitoringService.trackBusinessMetric(metric, value, tags)
  }

  // Track user session
  static trackUserSession(sessionData: {
    userId?: string
    sessionId: string
    startTime: Date
    userAgent: string
    referrer?: string
  }) {
    this.track('user_session', {
      session_id: sessionData.sessionId,
      start_time: sessionData.startTime.toISOString(),
      user_agent: sessionData.userAgent,
      referrer: sessionData.referrer
    }, sessionData.userId)

    // Track in Sentry
    MonitoringService.trackUserSession(sessionData)
  }

  // Clear user data
  static clearUserData() {
    if (this.posthog) {
      this.posthog.reset()
    }

    // Clear in Sentry
    MonitoringService.clearUserContext()
  }

  // Get user properties
  static getUserProperties(): Record<string, any> {
    if (this.posthog) {
      return this.posthog.get_property()
    }
    return {}
  }

  // Set user properties
  static setUserProperties(properties: Record<string, any>) {
    if (this.posthog) {
      this.posthog.set(properties)
    }
  }
}

// Performance monitoring utilities
export class PerformanceAnalytics {
  // Track page load performance
  static trackPageLoad(page: string) {
    if (typeof window === 'undefined') return

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart
      }

      // Track in analytics
      AnalyticsService.track('page_load_performance', {
        page,
        ...metrics
      })

      // Track in Sentry
      MonitoringService.trackPagePerformance(page, metrics)
    }
  }

  // Track Core Web Vitals
  static trackCoreWebVitals() {
    if (typeof window === 'undefined') return

    // Track LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        AnalyticsService.track('core_web_vital', {
          metric: 'LCP',
          value: lastEntry.startTime,
          page: window.location.pathname
        })
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Track FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming
        AnalyticsService.track('core_web_vital', {
          metric: 'FID',
          value: fidEntry.processingStart - fidEntry.startTime,
          page: window.location.pathname
        })
      })
    }).observe({ entryTypes: ['first-input'] })

    // Track CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const clsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!clsEntry.hadRecentInput && clsEntry.value) {
          clsValue += clsEntry.value
        }
      })
      AnalyticsService.track('core_web_vital', {
        metric: 'CLS',
        value: clsValue,
        page: window.location.pathname
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Track API performance
  static trackAPIPerformance(endpoint: string, duration: number, statusCode: number) {
    AnalyticsService.track('api_performance', {
      endpoint,
      duration,
      status_code: statusCode,
      success: statusCode < 400
    })

    // Track in Sentry
    MonitoringService.trackAPIPerformance(endpoint, duration, statusCode)
  }
}

// Initialize analytics on page load
if (typeof window !== 'undefined') {
  // Initialize analytics
  AnalyticsService.initialize()
  
  // Track page load performance
  PerformanceAnalytics.trackPageLoad(window.location.pathname)
  
  // Track Core Web Vitals
  PerformanceAnalytics.trackCoreWebVitals()
}

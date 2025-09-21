import posthog from 'posthog-js'

// Initialize PostHog
export const initAnalytics = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll capture manually
      capture_pageleave: true,
    })
  }
}

// Analytics event tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    })
  }
}

// User identification
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, properties)
  }
}

// Page view tracking
export const trackPageView = (path: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview', {
      $current_url: path,
      ...properties,
    })
  }
}

// Campaign-specific events
export const trackDonationStarted = (campaignId: string, amount: number) => {
  trackEvent('donation_started', {
    campaign_id: campaignId,
    amount,
    currency: 'USD',
  })
}

export const trackDonationCompleted = (campaignId: string, amount: number, donorEmail?: string) => {
  trackEvent('donation_completed', {
    campaign_id: campaignId,
    amount,
    currency: 'USD',
    donor_email: donorEmail ? 'provided' : 'anonymous',
  })
}

export const trackDonationFailed = (campaignId: string, amount: number, error: string) => {
  trackEvent('donation_failed', {
    campaign_id: campaignId,
    amount,
    currency: 'USD',
    error_message: error,
  })
}

export const trackEventRegistration = (eventId: string, eventTitle: string) => {
  trackEvent('event_registration', {
    event_id: eventId,
    event_title: eventTitle,
  })
}

export const trackCampaignCreated = (campaignId: string, title: string, goal: number) => {
  trackEvent('campaign_created', {
    campaign_id: campaignId,
    title,
    goal,
    currency: 'USD',
  })
}

export const trackUserRegistration = (userId: string, method: string) => {
  trackEvent('user_registration', {
    user_id: userId,
    registration_method: method,
  })
}

export const trackUserLogin = (userId: string, method: string) => {
  trackEvent('user_login', {
    user_id: userId,
    login_method: method,
  })
}

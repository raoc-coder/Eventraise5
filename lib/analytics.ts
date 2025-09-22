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
export const trackDonationStarted = (amount: number) => {
  trackEvent('donation_started', {
    amount,
    currency: 'USD',
  })
}

export const trackDonationCompleted = (_campaignId: string | undefined, amount: number, donorEmail?: string) => {
  trackEvent('donation_completed', {
    amount,
    currency: 'USD',
    donor_email: donorEmail ? 'provided' : 'anonymous',
  })
}

// Transparency & Trust Layer events
export const trackImpactBreakdownViewed = (allocation: { program: number; operations: number }) => {
  trackEvent('impact_breakdown_viewed', allocation)
}

export const trackImpactWidgetInteracted = (impactMetric: string, value: number) => {
  trackEvent('impact_widget_interacted', { impactMetric, value })
}

// Engagement-First Donation Experience events
export const trackOneClickDonate = (paymentMethod: 'apple_pay' | 'google_pay' | 'card') => {
  trackEvent('one_click_donate', { paymentMethod })
}

export const trackRecurringDonationSet = (interval: 'weekly' | 'monthly' | 'yearly', amount: number) => {
  trackEvent('recurring_donation_set', { interval, amount })
}

export const trackRoundUpEnabled = () => {
  trackEvent('roundup_enabled')
}

// Community & Storytelling
export const trackStoryViewed = (storyId: string) => {
  trackEvent('campaign_story_viewed', { storyId })
}

export const trackDonorWallInteracted = (action: 'like' | 'comment' | 'filter') => {
  trackEvent('donor_wall_interacted', { action })
}

// Marketplace & leaderboards
export const trackLeaderboardViewed = () => {
  trackEvent('leaderboard_viewed')
}

export const trackLeaderboardShare = () => {
  trackEvent('leaderboard_shared')
}

export const trackDonationFailed = (amount: number, error: string) => {
  trackEvent('donation_failed', {
    amount,
    currency: 'USD',
    error_message: error,
  })
}

export const trackEventRegistration = (eventId: string, eventTitle: string, amount: number, participantEmail: string) => {
  trackEvent('event_registration_started', {
    event_id: eventId,
    event_title: eventTitle,
    amount,
    participant_email: participantEmail,
  })
}

export const trackEventRegistrationCompleted = (eventId: string, eventTitle: string, amount: number, participantEmail: string) => {
  trackEvent('event_registration_completed', {
    event_id: eventId,
    event_title: eventTitle,
    amount,
    participant_email: participantEmail,
  })
}

export const trackEventRegistrationFailed = (eventId: string, eventTitle: string, amount: number, error: string) => {
  trackEvent('event_registration_failed', {
    event_id: eventId,
    event_title: eventTitle,
    amount,
    error,
  })
}

// Volunteer signup tracking
export const trackVolunteerSignup = (eventId: string, eventTitle: string, shiftId: string, volunteerEmail: string) => {
  trackEvent('volunteer_signup_started', {
    event_id: eventId,
    event_title: eventTitle,
    shift_id: shiftId,
    volunteer_email: volunteerEmail,
  })
}

export const trackVolunteerSignupCompleted = (eventId: string, eventTitle: string, shiftId: string, volunteerEmail: string) => {
  trackEvent('volunteer_signup_completed', {
    event_id: eventId,
    event_title: eventTitle,
    shift_id: shiftId,
    volunteer_email: volunteerEmail,
  })
}

export const trackVolunteerSignupFailed = (eventId: string, eventTitle: string, shiftId: string, error: string) => {
  trackEvent('volunteer_signup_failed', {
    event_id: eventId,
    event_title: eventTitle,
    shift_id: shiftId,
    error,
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

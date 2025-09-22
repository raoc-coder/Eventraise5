export const getAppUrl = () => {
  // In production on Vercel, use the Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Use the configured app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000'
}

export const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development'
}

// Feature flags to gradually roll out new modules. Keep low-risk defaults.
export const featureFlags = {
  transparencyAndTrust: false,
  smartCampaignManagement: false,
  engagementDonationExperience: false,
  communityAndStorytelling: false,
  securityComplianceEnhancements: false,
  marketplace: false,
  stripeConnect: false,
  aiSuggestions: false,
} as const

export type FeatureFlagKey = keyof typeof featureFlags

export const isFeatureEnabled = (flag: FeatureFlagKey) => {
  // Allow environment override e.g. NEXT_PUBLIC_FF_transparencyAndTrust=true
  const envKey = `NEXT_PUBLIC_FF_${flag}`.toUpperCase()
  const envVal = process.env[envKey]
  if (typeof envVal === 'string') {
    return envVal === 'true' || envVal === '1'
  }
  return featureFlags[flag]
}

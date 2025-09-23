/**
 * Authentication configuration for different environments
 */

export function getAuthRedirectUrl() {
  // Check if we're in production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/auth/callback';
    }
    
    // Fallback to current origin
    return `${window.location.origin}/auth/callback`;
  }
  
  // Server-side fallback
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/auth/callback`;
}

// Alternative: Force production URL for email confirmations
export function getEmailRedirectUrl() {
  // Prefer explicit app URL if provided
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return `${appUrl}/auth/callback`;
  }
  // Fallback to browser origin when available
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  // Default local
  return 'http://localhost:3000/auth/callback';
}

export function getConfirmRedirectUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/auth/confirm';
    }
    
    return `${window.location.origin}/auth/confirm`;
  }
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/auth/confirm`;
}

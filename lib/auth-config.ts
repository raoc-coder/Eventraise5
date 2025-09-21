/**
 * Authentication configuration for different environments
 */

export function getAuthRedirectUrl() {
  // Check if we're in production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domain
    if (hostname === 'eventraise2.vercel.app') {
      return 'https://eventraise2.vercel.app/auth/callback';
    }
    
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
  // Always use production URL for email confirmations
  // This ensures consistency with Supabase dashboard settings
  return 'https://eventraise2.vercel.app/auth/callback';
}

export function getConfirmRedirectUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'eventraise2.vercel.app') {
      return 'https://eventraise2.vercel.app/auth/confirm';
    }
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/auth/confirm';
    }
    
    return `${window.location.origin}/auth/confirm`;
  }
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${appUrl}/auth/confirm`;
}

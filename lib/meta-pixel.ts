// Meta Pixel (Facebook Pixel) integration for EventraiseHub

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & { loaded?: boolean; q?: any[]; push?: any; version?: string; queue?: any[] }
    _fbq?: any
  }
}

// Meta Pixel configuration
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// Initialize Meta Pixel
export const initMetaPixel = () => {
  if (typeof window === 'undefined' || !META_PIXEL_ID) {
    return
  }

  // Check if already initialized
  if (window.fbq && (window.fbq as any).loaded) {
    return
  }

  // Initialize fbq function
  const fbq = function(...args: any[]) {
    (fbq.q = fbq.q || []).push(args)
  } as any
  
  fbq.q = fbq.q || []
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  
  window.fbq = fbq
  window._fbq = fbq

  // Load Meta Pixel script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://connect.facebook.net/en_US/fbevents.js`
  document.head.appendChild(script)

  // Initialize pixel
  if (window.fbq) {
    window.fbq('init', META_PIXEL_ID)
    window.fbq('track', 'PageView')
  }
}

// Track page view
export const trackMetaPixelPageView = (url?: string) => {
  if (typeof window === 'undefined' || !window.fbq || !META_PIXEL_ID) {
    return
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'PageView', {
      content_name: url || window.location.pathname,
    })
  }
}

// Track custom event
export const trackMetaPixelEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.fbq || !META_PIXEL_ID) {
    return
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', eventName, parameters || {})
  }
}

// Track donation events
export const trackMetaPixelDonation = (amount: number, currency: string = 'USD', eventId?: string) => {
  trackMetaPixelEvent('Donate', {
    value: amount,
    currency,
    content_name: eventId ? `Event ${eventId}` : 'Donation',
    content_category: 'Donation',
  })
}

// Track purchase events (for tickets)
export const trackMetaPixelPurchase = (
  amount: number,
  currency: string = 'USD',
  eventId?: string,
  ticketId?: string,
  quantity?: number
) => {
  trackMetaPixelEvent('Purchase', {
    value: amount,
    currency,
    content_name: ticketId ? `Ticket ${ticketId}` : 'Ticket Purchase',
    content_category: 'Ticket',
    content_ids: ticketId ? [ticketId] : undefined,
    num_items: quantity,
  })
}

// Track registration events
export const trackMetaPixelRegistration = (eventId?: string, eventType?: string) => {
  trackMetaPixelEvent('CompleteRegistration', {
    content_name: eventId ? `Event ${eventId}` : 'Event Registration',
    content_category: eventType || 'Registration',
    status: true,
  })
}

// Track lead generation
export const trackMetaPixelLead = (eventId?: string) => {
  trackMetaPixelEvent('Lead', {
    content_name: eventId ? `Event ${eventId}` : 'Lead',
    content_category: 'Event Inquiry',
  })
}

// Track add to cart (for ticket selection)
export const trackMetaPixelAddToCart = (
  amount: number,
  currency: string = 'USD',
  ticketId?: string,
  quantity?: number
) => {
  trackMetaPixelEvent('AddToCart', {
    value: amount,
    currency,
    content_name: ticketId ? `Ticket ${ticketId}` : 'Ticket',
    content_category: 'Ticket',
    content_ids: ticketId ? [ticketId] : undefined,
    num_items: quantity,
  })
}

// Track initiate checkout
export const trackMetaPixelInitiateCheckout = (
  amount: number,
  currency: string = 'USD',
  eventId?: string
) => {
  trackMetaPixelEvent('InitiateCheckout', {
    value: amount,
    currency,
    content_name: eventId ? `Event ${eventId}` : 'Checkout',
    content_category: 'Checkout',
  })
}

// Track view content (for event pages)
export const trackMetaPixelViewContent = (eventId: string, eventTitle?: string) => {
  trackMetaPixelEvent('ViewContent', {
    content_name: eventTitle || `Event ${eventId}`,
    content_ids: [eventId],
    content_category: 'Event',
  })
}

// Track search (for event discovery)
export const trackMetaPixelSearch = (searchTerm: string) => {
  trackMetaPixelEvent('Search', {
    search_string: searchTerm,
  })
}


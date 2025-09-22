// Performance optimization utilities for EventraiseHUB
import { AnalyticsService, PerformanceAnalytics } from './analytics-enhanced'

// Image optimization
export class ImageOptimization {
  static getOptimizedImageUrl(
    src: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): string {
    // For Vercel Image Optimization
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      const params = new URLSearchParams()
      if (width) params.set('w', width.toString())
      if (height) params.set('h', height.toString())
      params.set('q', quality.toString())
      
      return `${process.env.NEXT_PUBLIC_VERCEL_URL}/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
    }
    
    return src
  }

  static getResponsiveImageSrcSet(
    src: string,
    sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(src, size)} ${size}w`)
      .join(', ')
  }

  static getResponsiveImageSizes(
    breakpoints: { [key: string]: string } = {
      '(max-width: 640px)': '100vw',
      '(max-width: 1024px)': '50vw',
      '(max-width: 1280px)': '33vw',
      'default': '25vw'
    }
  ): string {
    return Object.entries(breakpoints)
      .map(([condition, size]) => `${condition} ${size}`)
      .join(', ')
  }
}

// Bundle optimization
export class BundleOptimization {
  static getChunkName(module: string): string {
    // Generate predictable chunk names for better caching
    const hash = module.split('/').pop()?.replace(/\.(js|ts|tsx|jsx)$/, '') || 'unknown'
    return `chunk-${hash}`
  }

  static getLazyComponent(importFn: () => Promise<any>, fallback?: React.ComponentType) {
    return React.lazy(importFn)
  }

  static preloadComponent(importFn: () => Promise<any>) {
    // Preload component for better performance
    if (typeof window !== 'undefined') {
      importFn()
    }
  }

  static getCriticalCSS(): string {
    // Return critical CSS for above-the-fold content
    return `
      .hero-section { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .navigation { 
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
    `
  }
}

// Caching strategies
export class CachingStrategy {
  static getCacheHeaders(
    maxAge: number = 3600,
    staleWhileRevalidate: number = 86400
  ): Record<string, string> {
    return {
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      'CDN-Cache-Control': `public, max-age=${maxAge}`,
      'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`
    }
  }

  static getStaticCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000',
      'Vercel-CDN-Cache-Control': 'public, max-age=31536000'
    }
  }

  static getDynamicCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }

  static getAPI CacheHeaders(
    maxAge: number = 300,
    staleWhileRevalidate: number = 3600
  ): Record<string, string> {
    return {
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      'CDN-Cache-Control': `public, max-age=${maxAge}`,
      'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift()
    }
    
    // Track in analytics
    AnalyticsService.track('performance_metric', {
      metric: name,
      value,
      timestamp: Date.now()
    })
  }

  static getMetricStats(name: string): {
    average: number
    min: number
    max: number
    count: number
  } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null
    
    const sum = values.reduce((a, b) => a + b, 0)
    const average = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return { average, min, max, count: values.length }
  }

  static trackPageLoad(page: string) {
    if (typeof window === 'undefined') return
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      this.trackMetric(`page_load_${page}`, loadTime)
      
      // Track in analytics
      PerformanceAnalytics.trackPageLoad(page)
    }
  }

  static trackAPICall(endpoint: string, duration: number, statusCode: number) {
    this.trackMetric(`api_${endpoint}`, duration)
    
    // Track in analytics
    PerformanceAnalytics.trackAPIPerformance(endpoint, duration, statusCode)
  }

  static trackComponentRender(component: string, duration: number) {
    this.trackMetric(`component_${component}`, duration)
    
    // Track in analytics
    AnalyticsService.track('component_performance', {
      component,
      duration,
      timestamp: Date.now()
    })
  }
}

// Resource optimization
export class ResourceOptimization {
  static preloadCriticalResources() {
    if (typeof window === 'undefined') return
    
    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
    ]
    
    criticalFonts.forEach(font => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = font
      document.head.appendChild(link)
    })
    
    // Preload critical images
    const criticalImages = [
      '/images/hero-bg.jpg',
      '/images/logo.svg'
    ]
    
    criticalImages.forEach(image => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = image
      document.head.appendChild(link)
    })
  }

  static lazyLoadImages() {
    if (typeof window === 'undefined') return
    
    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      })
    })
    
    images.forEach(img => imageObserver.observe(img))
  }

  static optimizeThirdPartyScripts() {
    if (typeof window === 'undefined') return
    
    // Load non-critical scripts after page load
    window.addEventListener('load', () => {
      // Load analytics scripts
      const analyticsScripts = [
        'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
        'https://cdn.jsdelivr.net/npm/posthog-js@latest/dist/posthog.min.js'
      ]
      
      analyticsScripts.forEach(src => {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        document.head.appendChild(script)
      })
    })
  }
}

// Database optimization
export class DatabaseOptimization {
  static getOptimizedQuery(query: string, params: any[] = []): string {
    // Add query optimization hints
    const optimizedQuery = query
      .replace(/SELECT \*/g, 'SELECT /*+ USE_INDEX */')
      .replace(/WHERE/g, 'WHERE /*+ INDEX_HINT */')
    
    return optimizedQuery
  }

  static getConnectionPoolConfig() {
    return {
      max: 20,
      min: 5,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200
    }
  }

  static getQueryCacheConfig() {
    return {
      ttl: 300, // 5 minutes
      max: 1000,
      checkPeriod: 120
    }
  }
}

// CDN optimization
export class CDNOptimization {
  static getCDNUrl(path: string): string {
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.eventraisehub.com'
    return `${cdnUrl}${path}`
  }

  static getOptimizedAssetUrl(
    path: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): string {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', quality.toString())
    
    return `${this.getCDNUrl(path)}?${params.toString()}`
  }

  static getWebPUrl(path: string): string {
    // Return WebP version if supported
    if (typeof window !== 'undefined' && window.navigator.userAgent.includes('Chrome')) {
      return path.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }
    return path
  }
}

// Memory optimization
export class MemoryOptimization {
  private static cleanupFunctions: (() => void)[] = []

  static addCleanupFunction(cleanup: () => void) {
    this.cleanupFunctions.push(cleanup)
  }

  static cleanup() {
    this.cleanupFunctions.forEach(cleanup => cleanup())
    this.cleanupFunctions = []
  }

  static optimizeImages(images: HTMLImageElement[]) {
    images.forEach(img => {
      // Add loading="lazy" to non-critical images
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy')
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async')
      }
    })
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// Initialize performance optimizations
if (typeof window !== 'undefined') {
  // Preload critical resources
  ResourceOptimization.preloadCriticalResources()
  
  // Lazy load images
  ResourceOptimization.lazyLoadImages()
  
  // Optimize third-party scripts
  ResourceOptimization.optimizeThirdPartyScripts()
  
  // Track page load performance
  PerformanceMonitor.trackPageLoad(window.location.pathname)
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    MemoryOptimization.cleanup()
  })
}

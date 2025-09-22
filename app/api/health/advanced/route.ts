import { NextRequest, NextResponse } from 'next/server'
import { HealthCheckService } from '@/lib/monitoring-enhanced'
import { MonitoringService } from '@/lib/monitoring-enhanced'

// Advanced health check endpoint
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Run comprehensive health checks
    const healthResults = await HealthCheckService.runHealthCheck()
    
    // Check additional services
    const additionalChecks = await Promise.allSettled([
      checkRedis(),
      checkEmailService(),
      checkFileStorage(),
      checkCDN()
    ])
    
    // Calculate overall health score
    const healthyServices = Object.values(healthResults).filter(Boolean).length
    const totalServices = Object.keys(healthResults).length
    const healthScore = (healthyServices / totalServices) * 100
    
    // Track health check in monitoring
    MonitoringService.trackSystemHealth(healthResults)
    MonitoringService.trackPerformance('health_check', Date.now() - startTime)
    
    // Prepare response
    const response = {
      status: healthResults.overall ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      health_score: healthScore,
      services: {
        ...healthResults,
        redis: additionalChecks[0].status === 'fulfilled' ? additionalChecks[0].value : false,
        email: additionalChecks[1].status === 'fulfilled' ? additionalChecks[1].value : false,
        storage: additionalChecks[2].status === 'fulfilled' ? additionalChecks[2].value : false,
        cdn: additionalChecks[3].status === 'fulfilled' ? additionalChecks[3].value : false
      },
      performance: {
        response_time: Date.now() - startTime,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime()
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV
    }
    
    // Set appropriate status code
    const statusCode = healthResults.overall ? 200 : 503
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    // Track health check failure
    MonitoringService.trackCriticalError(error as Error, { 
      component: 'health_check',
      response_time: Date.now() - startTime
    })
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      performance: {
        response_time: Date.now() - startTime
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Check Redis connection
async function checkRedis(): Promise<boolean> {
  try {
    // This would check Redis connectivity
    // For now, return true as placeholder
    return true
  } catch (error) {
    return false
  }
}

// Check email service
async function checkEmailService(): Promise<boolean> {
  try {
    // This would check SendGrid or other email service
    // For now, return true as placeholder
    return true
  } catch (error) {
    return false
  }
}

// Check file storage
async function checkFileStorage(): Promise<boolean> {
  try {
    // This would check S3 or other file storage
    // For now, return true as placeholder
    return true
  } catch (error) {
    return false
  }
}

// Check CDN
async function checkCDN(): Promise<boolean> {
  try {
    // This would check CDN connectivity
    // For now, return true as placeholder
    return true
  } catch (error) {
    return false
  }
}

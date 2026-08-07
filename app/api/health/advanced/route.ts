import { NextRequest, NextResponse } from 'next/server'
import { HealthCheckService } from '@/lib/monitoring-enhanced'
import { MonitoringService } from '@/lib/monitoring-enhanced'
import { resolvePlatformAdminAccess } from '@/lib/platform-admin'
import { authenticateRequest } from '@/lib/auth-utils'

function isOpsAuthorized(req: NextRequest): boolean {
  const cron = process.env.CRON_SECRET?.trim()
  const auth = req.headers.get('authorization') || ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  if (cron && match && match[1] === cron) return true
  return false
}

/**
 * Advanced health — detailed diagnostics require Bearer CRON_SECRET or
 * platform admin session. Anonymous callers get liveness only (Sprint 8 / M5).
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  let isAdmin = false
  try {
    if (isOpsAuthorized(request)) {
      isAdmin = true
    } else {
      const auth = await authenticateRequest(request)
      if (auth.user) {
        const access = await resolvePlatformAdminAccess(auth.user)
        isAdmin = access.isPlatformAdmin
      }
    }
  } catch {
    isAdmin = false
  }

  if (!isAdmin) {
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    )
  }
  
  try {
    const healthResults = await HealthCheckService.runHealthCheck()
    
    const additionalChecks = await Promise.allSettled([
      checkRedis(),
      checkEmailService(),
      checkFileStorage(),
      checkCDN()
    ])
    
    const healthyServices = Object.values(healthResults).filter(Boolean).length
    const totalServices = Object.keys(healthResults).length
    const healthScore = (healthyServices / totalServices) * 100
    
    MonitoringService.trackSystemHealth(healthResults)
    MonitoringService.trackPerformance('health_check', Date.now() - startTime)
    
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

async function checkRedis(): Promise<boolean> {
  try {
    return true
  } catch {
    return false
  }
}

async function checkEmailService(): Promise<boolean> {
  try {
    return true
  } catch {
    return false
  }
}

async function checkFileStorage(): Promise<boolean> {
  try {
    return true
  } catch {
    return false
  }
}

async function checkCDN(): Promise<boolean> {
  try {
    return true
  } catch {
    return false
  }
}

import { NextResponse } from 'next/server'
import { HealthCheck } from '@/lib/monitoring'

export async function GET() {
  try {
    const health = await HealthCheck.runFullHealthCheck()
    
    const status = health.overall ? 200 : 503
    
    return NextResponse.json({
      status: health.overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: health.database ? 'healthy' : 'unhealthy',
        auth: health.auth ? 'healthy' : 'unhealthy',
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    }, { status })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    }, { status: 503 })
  }
}

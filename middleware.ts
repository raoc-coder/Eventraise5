import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  // Redirect www to apex
  if (host.toLowerCase().startsWith('www.eventraisehub.com')) {
    const url = new URL(request.url)
    url.host = 'eventraisehub.com'
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}



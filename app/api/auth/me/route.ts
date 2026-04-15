import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, isOwnerAdminUser } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if (!auth.user) {
    return NextResponse.json({ authenticated: false, isOwnerAdmin: false })
  }

  return NextResponse.json({
    authenticated: true,
    isOwnerAdmin: isOwnerAdminUser(auth.user),
    user: {
      id: auth.user.id,
      email: auth.user.email,
    },
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

const SESSION_COOKIE_NAME = '__session'

// GET /api/auth/verify — verify session cookie, used by middleware
export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return NextResponse.json({ valid: false }, { status: 401 })
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true /* checkRevoked */)
    if (!decoded.admin) {
      return NextResponse.json({ valid: false }, { status: 403 })
    }
    return NextResponse.json({ valid: true, uid: decoded.uid })
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 })
  }
}

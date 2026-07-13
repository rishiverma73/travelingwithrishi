import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

const SESSION_COOKIE_NAME = '__session'
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// POST /api/auth/session — exchange Firebase ID token for a session cookie
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 })
    }

    // Verify the ID token and check admin claim
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (!decoded.admin) {
      return NextResponse.json({ error: 'Unauthorized: not an admin account' }, { status: 403 })
    }

    // Create a session cookie valid for 30 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRY_MS,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS / 1000, // seconds
      path: '/',
    })
    return res
  } catch (error: any) {
    console.error('Session POST error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}

// DELETE /api/auth/session — clear session cookie (logout)
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return res
}

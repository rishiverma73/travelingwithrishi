import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE_NAME = '__session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow the login page through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Verify the session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  try {
    // Import Admin SDK dynamically — middleware runs in Node.js edge-compatible runtime
    // but firebase-admin requires Node.js runtime. We specify runtime in next.config if needed.
    // For Next.js 14 App Router, middleware runs in Edge by default, but we can override.
    // We'll do a lightweight check: verify the cookie exists and call our own verify endpoint.
    const verifyUrl = new URL('/api/auth/verify', req.url)
    const verifyRes = await fetch(verifyUrl, {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${sessionCookie}` },
    })

    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}

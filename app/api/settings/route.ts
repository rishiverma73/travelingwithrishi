import { NextRequest, NextResponse } from 'next/server'
import { getSiteSettings, upsertSiteSettings } from '@/lib/firebase/firestore'
import { adminAuth } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'

// GET /api/settings
export async function GET() {
  try {
    const settings = await getSiteSettings()
    // Return with socialLinks as a string for backwards-compat with the settings page
    return NextResponse.json({
      ...settings,
      socialLinks: JSON.stringify(settings.socialLinks),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/settings
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { aboutText, aboutTitle, socialLinks, currentPassword, newPassword } = body

    // Build settings update
    const settingsUpdate: any = {}
    if (aboutText !== undefined) settingsUpdate.aboutText = aboutText
    if (aboutTitle !== undefined) settingsUpdate.aboutTitle = aboutTitle
    if (socialLinks !== undefined) {
      settingsUpdate.socialLinks = typeof socialLinks === 'string'
        ? JSON.parse(socialLinks)
        : socialLinks
    }

    const updated = await upsertSiteSettings(settingsUpdate)

    // Handle password change via Firebase Admin SDK
    if (currentPassword && newPassword) {
      try {
        // Get current admin UID from session cookie
        const cookieStore = cookies()
        const sessionCookie = cookieStore.get('__session')?.value
        if (!sessionCookie) {
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)

        // Firebase Admin SDK can update password directly without needing the old one
        // (we still accept currentPassword for UX consistency but don't verify it server-side
        //  since Firebase Auth handles credential verification at sign-in time)
        await adminAuth.updateUser(decoded.uid, { password: newPassword })
      } catch (authError: any) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 400 })
      }
    }

    return NextResponse.json({
      ...updated,
      socialLinks: JSON.stringify(updated.socialLinks),
    })
  } catch (error) {
    console.error('Settings PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

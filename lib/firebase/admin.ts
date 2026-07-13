/**
 * Firebase Admin SDK — server-only. Never import in client components.
 * Uses service account credentials from non-NEXT_PUBLIC_ env vars.
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'

function getAdminApp(): App | null {
  if (getApps().length > 0) return getApps()[0]

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: privateKey!,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  } catch (error) {
    console.warn('Firebase Admin init skipped (expected during build if env vars are missing)')
    return null
  }
}

const adminApp = getAdminApp()

export const adminAuth: Auth = adminApp ? getAuth(adminApp) : ({} as Auth)
export const adminDb: Firestore = adminApp ? getFirestore(adminApp) : ({} as Firestore)
export const adminStorage: Storage = adminApp ? getStorage(adminApp) : ({} as Storage)
export { adminApp }

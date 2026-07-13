/**
 * Firebase Admin SDK — server-only. Never import in client components.
 * Uses service account credentials from non-NEXT_PUBLIC_ env vars.
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]

  // FIREBASE_PRIVATE_KEY comes from .env with escaped newlines (\n as literal string)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

const adminApp: App = getAdminApp()

export const adminAuth: Auth = getAuth(adminApp)
export const adminDb: Firestore = getFirestore(adminApp)
export const adminStorage: Storage = getStorage(adminApp)
export { adminApp }

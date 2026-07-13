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
    return initializeApp({
      credential: cert({
        projectId: 'traveling-with-rishi',
        clientEmail: 'firebase-adminsdk-fbsvc@traveling-with-rishi.iam.gserviceaccount.com',
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3LM4IDGZ+EPLj\nArcTiUo4Jq8Wk7pbHLLzHGWiy/PbCQs6fDaBKw4R9Zl11Lqti4G43DQBBhdYst8V\nAlFzCbposuOmURpsR++b/FqT/AQi3RkQA8gid+9iYMQHd8GfzuA8diGc09fwAr3I\nQQUZi+UoKRMV7b3mvLnADo+G4+pe5l/4PejFO4woSZ9NjS2qaQUCMoy8yxNYFRHS\nZ2l8IJtToLXSm7Uw4DRy9cTwZnAVBZ5DlL7l0WAX6jKEV8UFnbMzI4mQOQzwTqNz\n3GmxH5lCPb7E2J2CR2vT1bwob5U5r+N42RtIGDVCwNy0WUM69Kn4PJvtT0jWXyA7\nbW685N3rAgMBAAECggEAEzN6phmqqr9bE+nRHWv69YzfNgDRUZizYiGRaTHI7lEc\ni1/BlOOvALnxLAqwcN2wAPFFmu/eWvlmbLzb+IZGCJCWpXSt+ONyM184yCIW9ZKd\n/HGbtTqY7i6SOJgt70hlIAwKtPZN60ZWSjC/+Jq+BZTcqnlL5UKA6X19P8Nnaiq9\nnBHiXe6YT3PQWwPxa0/eFNSjxQs4MlrH+nolT1uIn3NYIDOxbxcJ0h3cNoxFWRc9\nQ8VxJSAw5yTxeEG4vclrv8lj3TV+uyDK2n/mwdfMGbcWq3l9rI73UuioZnQ2+n+5\n6p2hdLnfg9NaQjUmQpFCOcTbe8OyNMIVI7Ef0XjzuQKBgQDYuVHCbK18BTmaqfAN\njIV62sp6+Hcidv+xD8l4FiLjNv1GqVbrGsfJMlYH5+S6nzqc3K4ZQQ1gupquMiBW\naa9i8Adxg+JYU3C8wh2utCwEuEGl7gDEtjSoMU4cyNA5EA49+6Utmy0GW42zOuOU\nW63YFyOPUS8a81maUqXmr9CTwwKBgQDYXwUNC0a5SmP2mMiXL397i41vhGhQyesW\n0W5e2ZWz4HH83qKKnumcrYdPzv71T8LuQpXZPWTnbAxWX3m7Thklx3x4/N3nI37y\nLfM58eT0wVC3XZ9UdQZUGEkuSM/66DZgvgD6qUXs5oi2LrX3IDvj9Sr2yXtvQA3B\nkManxZoyuQKBgDffjzSQ0CkpL7CwHzNfBwqlXY5WgGBiTYlYiJhtHJF3m9Sb08zJ\nGrjEQWnIXy+93V6Thk78dnZ5pWdDhRLCLHVVbJXXaoNa/7WqVfy0dqTA3CvrMEeG\nsgyqqXjCTOxpN0LDndIkL3d0IxQSGpolCKytSn2ocHyCQJeItzzCFwQBAoGABxuw\nBcquCx5HhG1mgZj83ikqf1RhPO41O+2ra5BIW71u4TjLLDSmRhBpVpTdSV/SbpNf\nauCadQPWr+u5Cw84wkX4b90WySYgYIJj8C5jMCs9pJh9yH+DsrWNiei4dGy2hJ0Z\nWSLAelTkft+v+KtlbEq8m5jo5jG7gfVooVBbjXkCgYEAnq9k+PmZVaupwz1b6xqR\nY5yFISCR1CFawAG2YeCN12nAI8hmmSiR7o3Com+dlZPwAGKgLopvQ+l3q+EF4ebi\nn2n0tAW9Xd/OrT/Jb/wyrwMxfwRqQ32wcGKwxycul0CWz3OxoTGKMOoCiyd/oI1X\nqUtS26SJX/U6xIt73pw7BSA=\n-----END PRIVATE KEY-----\n",
      }),
      storageBucket: 'traveling-with-rishi.firebasestorage.app',
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

/**
 * Firebase Client SDK — safe to import in browser/client components.
 * Uses NEXT_PUBLIC_ env vars only.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD_igl2qP8e3YPdKny3_XjqdCZ4s5ZDpbo",
  authDomain: "traveling-with-rishi.firebaseapp.com",
  projectId: "traveling-with-rishi",
  storageBucket: "traveling-with-rishi.firebasestorage.app",
  messagingSenderId: "254027192448",
  appId: "1:254027192448:web:9a1b0751ca8d277bc92e65",
  measurementId: "G-H4J9T5KP6V"
};

// Prevent re-initialization during hot reload in development
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const auth: Auth = getAuth(app)
export const storage: FirebaseStorage = getStorage(app)
export { app }

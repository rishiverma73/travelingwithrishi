/**
 * One-time script: Grant admin custom claim to a Firebase Auth user.
 *
 * Run AFTER:
 *  1. Creating the admin account in Firebase Console → Authentication
 *  2. Getting the UID from Firebase Console → Authentication → Users tab
 *
 * Run with:
 *   ADMIN_UID="your-firebase-user-uid" node scripts/setup-admin.mjs
 *
 * Or set ADMIN_UID in .env.local and run:
 *   node scripts/setup-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
try {
  const env = readFileSync(envPath, 'utf8')
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=')
    if (key && !key.startsWith('#') && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '')
    }
  }
} catch {
  console.log('No .env.local found — using existing environment variables.')
}

const adminUid = process.env.ADMIN_UID
if (!adminUid) {
  console.error('❌ Error: ADMIN_UID environment variable is required.')
  console.error('   Set it in .env.local or pass it as an env var:')
  console.error('   ADMIN_UID="your-uid" node scripts/setup-admin.mjs')
  process.exit(1)
}

// Initialize Admin SDK
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
})

const auth = getAuth()

async function main() {
  console.log(`\n🔐 Granting admin claim to UID: ${adminUid}`)

  // Check user exists
  let user
  try {
    user = await auth.getUser(adminUid)
  } catch {
    console.error(`❌ User with UID "${adminUid}" not found in Firebase Auth.`)
    console.error('   Create the user first in Firebase Console → Authentication → Add user.')
    process.exit(1)
  }

  console.log(`   Email: ${user.email}`)

  // Set the admin custom claim
  await auth.setCustomUserClaims(adminUid, { admin: true })

  console.log('\n✅ Admin claim granted!')
  console.log('   The user will have admin access on their next login.')
  console.log('\n📌 Next steps:')
  console.log('   1. Go to http://localhost:3000/admin/login')
  console.log(`   2. Sign in with: ${user.email}`)
  console.log('   3. You\'re in! 🎉')

  process.exit(0)
}

main().catch(err => {
  console.error('❌ Failed:', err)
  process.exit(1)
})

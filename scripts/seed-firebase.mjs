/**
 * One-time script: Seeds the 36 Indian states & UTs into Firestore.
 *
 * Run with:  node scripts/seed-firebase.mjs
 *
 * Prerequisites:
 *  - Copy .env.local.example to .env.local and fill in all values
 *  - npm install dotenv (or run with: node --env-file=.env.local scripts/seed-firebase.mjs)
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local manually (dotenv not required)
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

// Initialize Admin SDK
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  }),
})

const db = getFirestore()

// All 28 states + 8 union territories of India
const DESTINATIONS = [
  // States
  { name: 'Andhra Pradesh', type: 'STATE', region: 'South India', accentColor: '#2E7D32' },
  { name: 'Arunachal Pradesh', type: 'STATE', region: 'Northeast India', accentColor: '#6A1B9A' },
  { name: 'Assam', type: 'STATE', region: 'Northeast India', accentColor: '#0277BD' },
  { name: 'Bihar', type: 'STATE', region: 'East India', accentColor: '#EF6C00' },
  { name: 'Chhattisgarh', type: 'STATE', region: 'Central India', accentColor: '#558B2F' },
  { name: 'Goa', type: 'STATE', region: 'West India', accentColor: '#00838F' },
  { name: 'Gujarat', type: 'STATE', region: 'West India', accentColor: '#F9A825' },
  { name: 'Haryana', type: 'STATE', region: 'North India', accentColor: '#4527A0' },
  { name: 'Himachal Pradesh', type: 'STATE', region: 'North India', accentColor: '#283593' },
  { name: 'Jharkhand', type: 'STATE', region: 'East India', accentColor: '#BF360C' },
  { name: 'Karnataka', type: 'STATE', region: 'South India', accentColor: '#E65100' },
  { name: 'Kerala', type: 'STATE', region: 'South India', accentColor: '#1B5E20' },
  { name: 'Madhya Pradesh', type: 'STATE', region: 'Central India', accentColor: '#880E4F' },
  { name: 'Maharashtra', type: 'STATE', region: 'West India', accentColor: '#B71C1C' },
  { name: 'Manipur', type: 'STATE', region: 'Northeast India', accentColor: '#4E342E' },
  { name: 'Meghalaya', type: 'STATE', region: 'Northeast India', accentColor: '#1565C0' },
  { name: 'Mizoram', type: 'STATE', region: 'Northeast India', accentColor: '#0D47A1' },
  { name: 'Nagaland', type: 'STATE', region: 'Northeast India', accentColor: '#37474F' },
  { name: 'Odisha', type: 'STATE', region: 'East India', accentColor: '#E65100' },
  { name: 'Punjab', type: 'STATE', region: 'North India', accentColor: '#4527A0' },
  { name: 'Rajasthan', type: 'STATE', region: 'North India', accentColor: '#E64A19' },
  { name: 'Sikkim', type: 'STATE', region: 'Northeast India', accentColor: '#1A237E' },
  { name: 'Tamil Nadu', type: 'STATE', region: 'South India', accentColor: '#B71C1C' },
  { name: 'Telangana', type: 'STATE', region: 'South India', accentColor: '#880E4F' },
  { name: 'Tripura', type: 'STATE', region: 'Northeast India', accentColor: '#006064' },
  { name: 'Uttar Pradesh', type: 'STATE', region: 'North India', accentColor: '#F57F17' },
  { name: 'Uttarakhand', type: 'STATE', region: 'North India', accentColor: '#2E7D32' },
  { name: 'West Bengal', type: 'STATE', region: 'East India', accentColor: '#1565C0' },
  // Union Territories
  { name: 'Andaman and Nicobar Islands', type: 'UNION_TERRITORY', region: 'South India', accentColor: '#00695C' },
  { name: 'Chandigarh', type: 'UNION_TERRITORY', region: 'North India', accentColor: '#546E7A' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'UNION_TERRITORY', region: 'West India', accentColor: '#00796B' },
  { name: 'Delhi', type: 'UNION_TERRITORY', region: 'North India', accentColor: '#C62828' },
  { name: 'Jammu and Kashmir', type: 'UNION_TERRITORY', region: 'North India', accentColor: '#5C6BC0' },
  { name: 'Ladakh', type: 'UNION_TERRITORY', region: 'North India', accentColor: '#78909C' },
  { name: 'Lakshadweep', type: 'UNION_TERRITORY', region: 'South India', accentColor: '#0097A7' },
  { name: 'Puducherry', type: 'UNION_TERRITORY', region: 'South India', accentColor: '#AD1457' },
]

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[&]+/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function seedDestinations() {
  console.log('🗺️  Seeding destinations...')
  let created = 0
  let skipped = 0

  for (const dest of DESTINATIONS) {
    const slug = slugify(dest.name)
    const docRef = db.collection('destinations').doc(slug)
    const existing = await docRef.get()

    if (existing.exists) {
      console.log(`  ⏭  Skipping: ${dest.name} (already exists)`)
      skipped++
      continue
    }

    await docRef.set({
      name: dest.name,
      slug,
      type: dest.type,
      region: dest.region,
      accentColor: dest.accentColor,
      isCustom: false,
      isDeletable: false,
      createdAt: Timestamp.now(),
    })

    console.log(`  ✅ Created: ${dest.name}`)
    created++
  }

  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`)
}

async function seedSettings() {
  console.log('\n⚙️  Seeding site settings...')
  const docRef = db.doc('settings/site')
  const existing = await docRef.get()

  if (existing.exists) {
    console.log('  ⏭  Site settings already exist. Skipping.')
    return
  }

  await docRef.set({
    aboutTitle: 'Every State. Every Story.',
    aboutText: "I'm Rishi, and I'm on a mission to visit every single state and union territory of India — not as a tourist ticking boxes, but as a traveler who actually stays, eats, wanders, and comes back with something to say.\n\nThis isn't a travel blog in the traditional sense. It's a diary. A record of what I spent, what I saw, what I'd tell a first-timer, and what made each place worth the journey. The good, the expensive, the chaotic, and the quietly beautiful.\n\nIndia has 28 states and 8 union territories — 36 in total. I'm going through every one. Come along for the ride.",
    socialLinks: { instagram: '', twitter: '', youtube: '', email: '' },
    updatedAt: Timestamp.now(),
  })

  console.log('  ✅ Site settings created.')
}

async function main() {
  console.log('🚀 Starting Firebase seed...\n')
  await seedDestinations()
  await seedSettings()
  console.log('\n🎉 Seed complete! Your Firestore is ready.')
  process.exit(0)
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

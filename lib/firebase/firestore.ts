/**
 * Firestore data-access layer (server-side only, uses Admin SDK).
 *
 * Replaces all Prisma queries. All functions return plain JS objects
 * suitable for passing to client components as props.
 *
 * Data model:
 *  - destinations/{slug}          (doc ID = slug)
 *  - trips/{tripId}               (auto-ID, stores denormalized destination object)
 *  - trips/{tripId}/photos/{id}   (subcollection)
 *  - settings/site                (single settings doc)
 */

import { adminDb } from './admin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { slugify, generateTripSlug } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Destination {
  id: string          // = slug
  slug: string
  name: string
  type: 'STATE' | 'UNION_TERRITORY' | 'COUNTRY'
  region: string | null
  accentColor: string
  isCustom: boolean
  isDeletable: boolean
  createdAt: string   // ISO string
  trips?: Trip[]      // populated by getDestinationWithTrips
}

export interface CostBreakdown {
  travel: number
  stay: number
  food: number
  activities: number
  misc: number
}

export interface Trip {
  id: string
  destinationSlug: string
  destination: {
    id: string
    slug: string
    name: string
    type: string
    region: string | null
    accentColor: string
  }
  placeName: string
  slug: string
  cityRegion: string | null
  description: string
  bestPart: string | null
  totalCost: number
  currency: string
  costBreakdown: CostBreakdown
  dateFrom: string | null   // ISO string
  dateTo: string | null     // ISO string
  durationDays: number | null
  rating: number
  tags: string[]
  tips: string | null
  isPublished: boolean
  isFeatured: boolean
  coverPhotoUrl: string
  photos?: Photo[]
  createdAt: string
  updatedAt: string
}

export interface Photo {
  id: string
  tripId: string
  url: string
  caption: string | null
  sortOrder: number
  isCoverPhoto: boolean
}

export interface SiteSettings {
  id: string
  aboutTitle: string
  aboutText: string
  socialLinks: Record<string, string>
  updatedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timestampToISO(ts: any): string | null {
  if (!ts) return null
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  if (typeof ts === 'string') return ts
  return null
}

function docToDestination(doc: FirebaseFirestore.DocumentSnapshot): Destination {
  const d = doc.data()!
  return {
    id: doc.id,
    slug: doc.id,
    name: d.name,
    type: d.type,
    region: d.region ?? null,
    accentColor: d.accentColor ?? '#C9972C',
    isCustom: d.isCustom ?? false,
    isDeletable: d.isDeletable ?? false,
    createdAt: timestampToISO(d.createdAt) ?? new Date().toISOString(),
  }
}

function docToTrip(doc: FirebaseFirestore.DocumentSnapshot, photos: Photo[] = []): Trip {
  const d = doc.data()!
  return {
    id: doc.id,
    destinationSlug: d.destinationSlug,
    destination: d.destination ?? { id: d.destinationSlug, slug: d.destinationSlug, name: d.destinationSlug, type: 'STATE', region: null, accentColor: '#C9972C' },
    placeName: d.placeName,
    slug: d.slug,
    cityRegion: d.cityRegion ?? null,
    description: d.description,
    bestPart: d.bestPart ?? null,
    totalCost: d.totalCost ?? 0,
    currency: d.currency ?? 'INR',
    costBreakdown: d.costBreakdown ?? { travel: 0, stay: 0, food: 0, activities: 0, misc: 0 },
    dateFrom: timestampToISO(d.dateFrom),
    dateTo: timestampToISO(d.dateTo),
    durationDays: d.durationDays ?? null,
    rating: d.rating ?? 5,
    tags: d.tags ?? [],
    tips: d.tips ?? null,
    isPublished: d.isPublished ?? false,
    isFeatured: d.isFeatured ?? false,
    coverPhotoUrl: d.coverPhotoUrl ?? '',
    photos,
    createdAt: timestampToISO(d.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToISO(d.updatedAt) ?? new Date().toISOString(),
  }
}

function docToPhoto(doc: FirebaseFirestore.DocumentSnapshot, tripId: string): Photo {
  const d = doc.data()!
  return {
    id: doc.id,
    tripId,
    url: d.url,
    caption: d.caption ?? null,
    sortOrder: d.sortOrder ?? 0,
    isCoverPhoto: d.isCoverPhoto ?? false,
  }
}

// ─── Destinations ─────────────────────────────────────────────────────────────

export async function getDestinations(opts: {
  withTripCounts?: boolean
  withPublishedTrips?: boolean
} = {}): Promise<(Destination & { trips?: any[] })[]> {
  const snap = await adminDb.collection('destinations').get()
  const destinations = snap.docs.map(docToDestination)

  // Sort by region ASC, then name ASC
  destinations.sort((a, b) => {
    const regionA = a.region || ''
    const regionB = b.region || ''
    if (regionA !== regionB) return regionA.localeCompare(regionB)
    return a.name.localeCompare(b.name)
  })

  if (!opts.withTripCounts && !opts.withPublishedTrips) {
    return destinations
  }

  // Fetch published trips for each destination (for counts and passport wall)
  const tripsSnap = await adminDb.collection('trips').where('isPublished', '==', true).get()
  const tripsByDest: Record<string, any[]> = {}

  for (const tripDoc of tripsSnap.docs) {
    const t = tripDoc.data()
    const ds = t.destinationSlug
    if (!tripsByDest[ds]) tripsByDest[ds] = []

    if (opts.withPublishedTrips) {
      // Include photos subcollection? No — too expensive. Just include trip data.
      const photosSnap = await adminDb.collection('trips').doc(tripDoc.id).collection('photos').orderBy('sortOrder').get()
      const photos = photosSnap.docs.map(p => docToPhoto(p, tripDoc.id))
      tripsByDest[ds].push(docToTrip(tripDoc, photos))
    } else {
      tripsByDest[ds].push({ id: tripDoc.id, rating: t.rating, totalCost: t.totalCost })
    }
  }

  return destinations.map(d => ({
    ...d,
    trips: tripsByDest[d.slug] ?? [],
  }))
}

export async function getDestinationBySlug(slug: string): Promise<Destination | null> {
  const doc = await adminDb.collection('destinations').doc(slug).get()
  if (!doc.exists) return null
  return docToDestination(doc)
}

export async function getDestinationWithTrips(slug: string): Promise<(Destination & { trips: Trip[] }) | null> {
  const destDoc = await adminDb.collection('destinations').doc(slug).get()
  if (!destDoc.exists) return null
  const dest = docToDestination(destDoc)

  const tripsSnap = await adminDb
    .collection('trips')
    .where('destinationSlug', '==', slug)
    .get()

  const trips: Trip[] = []
  for (const tripDoc of tripsSnap.docs) {
    const photosSnap = await adminDb.collection('trips').doc(tripDoc.id).collection('photos').orderBy('sortOrder').get()
    const photos = photosSnap.docs.map(p => docToPhoto(p, tripDoc.id))
    const trip = docToTrip(tripDoc, photos)
    if (trip.isPublished) {
      trips.push(trip)
    }
  }

  // Sort by dateFrom DESC
  trips.sort((a, b) => {
    const dateA = a.dateFrom ? new Date(a.dateFrom).getTime() : 0
    const dateB = b.dateFrom ? new Date(b.dateFrom).getTime() : 0
    return dateB - dateA
  })

  return { ...dest, trips }
}

export async function createDestination(data: {
  name: string
  type: string
  region?: string
  accentColor?: string
}): Promise<Destination> {
  const slug = slugify(data.name)

  // Check duplicate
  const existing = await adminDb.collection('destinations').doc(slug).get()
  if (existing.exists) {
    throw new Error('A destination with this name already exists')
  }

  const now = Timestamp.now()
  const docData = {
    name: data.name,
    slug,
    type: data.type,
    region: data.region ?? null,
    accentColor: data.accentColor ?? '#C9972C',
    isCustom: true,
    isDeletable: true,
    createdAt: now,
  }

  await adminDb.collection('destinations').doc(slug).set(docData)
  const doc = await adminDb.collection('destinations').doc(slug).get()
  return docToDestination(doc)
}

export async function updateDestination(slug: string, data: Partial<{
  name: string
  type: string
  region: string | null
  accentColor: string
}>): Promise<Destination> {
  const ref = adminDb.collection('destinations').doc(slug)
  await ref.update(data)
  const doc = await ref.get()
  return docToDestination(doc)
}

export async function deleteDestination(slug: string): Promise<void> {
  await adminDb.collection('destinations').doc(slug).delete()
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export async function getTrips(opts: {
  destinationSlug?: string
  publishedOnly?: boolean
  featured?: boolean
  limit?: number
  search?: string
  includePhotos?: boolean
} = {}): Promise<Trip[]> {
  // Fetch all trips (travel diary scale is small enough for in-memory processing)
  const snap = await adminDb.collection('trips').get()
  let trips: Trip[] = []

  for (const doc of snap.docs) {
    let photos: Photo[] = []
    if (opts.includePhotos) {
      const photosSnap = await adminDb.collection('trips').doc(doc.id).collection('photos').orderBy('sortOrder').get()
      photos = photosSnap.docs.map(p => docToPhoto(p, doc.id))
    }
    const trip = docToTrip(doc, photos)
    
    // Apply filters
    if (opts.destinationSlug && trip.destinationSlug !== opts.destinationSlug) continue
    if (opts.publishedOnly && !trip.isPublished) continue
    if (opts.featured && !trip.isFeatured) continue
    
    trips.push(trip)
  }

  // Apply sorting: featured first, then createdAt desc
  trips.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1
    if (!a.isFeatured && b.isFeatured) return 1
    const timeA = new Date(a.createdAt).getTime()
    const timeB = new Date(b.createdAt).getTime()
    return timeB - timeA
  })

  // Apply limit
  if (opts.limit) {
    trips = trips.slice(0, opts.limit)
  }

  // Client-side search filter (Firestore doesn't support full-text)
  if (opts.search) {
    const q = opts.search.toLowerCase()
    trips = trips.filter(t =>
      t.placeName.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.cityRegion ?? '').toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    )
  }

  return trips
}

export async function getTripById(id: string, includePhotos = true): Promise<Trip | null> {
  const doc = await adminDb.collection('trips').doc(id).get()
  if (!doc.exists) return null

  let photos: Photo[] = []
  if (includePhotos) {
    const photosSnap = await adminDb.collection('trips').doc(id).collection('photos').orderBy('sortOrder').get()
    photos = photosSnap.docs.map(p => docToPhoto(p, id))
  }

  return docToTrip(doc, photos)
}

export async function getTripBySlug(slug: string, publishedOnly = false): Promise<Trip | null> {
  let query: FirebaseFirestore.Query = adminDb.collection('trips').where('slug', '==', slug)
  if (publishedOnly) {
    query = query.where('isPublished', '==', true)
  }
  const snap = await query.limit(1).get()
  if (snap.empty) return null

  const doc = snap.docs[0]
  const photosSnap = await adminDb.collection('trips').doc(doc.id).collection('photos').orderBy('sortOrder').get()
  const photos = photosSnap.docs.map(p => docToPhoto(p, doc.id))
  return docToTrip(doc, photos)
}

export async function getTripCount(publishedOnly = false): Promise<number> {
  let query: FirebaseFirestore.Query = adminDb.collection('trips')
  if (publishedOnly) query = query.where('isPublished', '==', true)
  const snap = await query.count().get()
  return snap.data().count
}

export async function getTripAggregate(publishedOnly = false): Promise<{ count: number; totalSpent: number }> {
  let query: FirebaseFirestore.Query = adminDb.collection('trips')
  if (publishedOnly) query = query.where('isPublished', '==', true)
  const snap = await query.get()
  let totalSpent = 0
  for (const doc of snap.docs) {
    totalSpent += doc.data().totalCost ?? 0
  }
  return { count: snap.size, totalSpent }
}

export async function createTrip(data: {
  destinationSlug: string
  placeName: string
  cityRegion?: string
  description: string
  bestPart?: string
  totalCost?: number
  currency?: string
  costBreakdown?: CostBreakdown
  dateFrom?: string
  dateTo?: string
  durationDays?: number
  rating?: number
  tags?: string[]
  tips?: string
  isPublished?: boolean
  isFeatured?: boolean
}): Promise<Trip> {
  const destDoc = await adminDb.collection('destinations').doc(data.destinationSlug).get()
  if (!destDoc.exists) throw new Error('Destination not found')
  const dest = docToDestination(destDoc)

  // Generate unique slug
  const year = data.dateFrom ? new Date(data.dateFrom).getFullYear() : new Date().getFullYear()
  let slug = generateTripSlug(data.placeName, dest.slug, year)

  // Ensure unique slug
  const existing = await adminDb.collection('trips').where('slug', '==', slug).limit(1).get()
  if (!existing.empty) {
    slug = `${slug}-${Date.now()}`
  }

  const now = Timestamp.now()
  const docData = {
    destinationSlug: data.destinationSlug,
    destination: {
      id: dest.slug,
      slug: dest.slug,
      name: dest.name,
      type: dest.type,
      region: dest.region,
      accentColor: dest.accentColor,
    },
    placeName: data.placeName,
    slug,
    cityRegion: data.cityRegion ?? null,
    description: data.description,
    bestPart: data.bestPart ?? null,
    totalCost: data.totalCost ?? 0,
    currency: data.currency ?? 'INR',
    costBreakdown: data.costBreakdown ?? { travel: 0, stay: 0, food: 0, activities: 0, misc: 0 },
    dateFrom: data.dateFrom ? Timestamp.fromDate(new Date(data.dateFrom)) : null,
    dateTo: data.dateTo ? Timestamp.fromDate(new Date(data.dateTo)) : null,
    durationDays: data.durationDays ?? null,
    rating: data.rating ?? 5,
    tags: data.tags ?? [],
    tips: data.tips ?? null,
    isPublished: data.isPublished ?? false,
    isFeatured: data.isFeatured ?? false,
    coverPhotoUrl: '',
    createdAt: now,
    updatedAt: now,
  }

  const ref = await adminDb.collection('trips').add(docData)
  const doc = await ref.get()
  return docToTrip(doc, [])
}

export async function updateTrip(id: string, data: Partial<{
  destinationSlug: string
  placeName: string
  cityRegion: string | null
  description: string
  bestPart: string | null
  totalCost: number
  currency: string
  costBreakdown: CostBreakdown
  dateFrom: string | null
  dateTo: string | null
  durationDays: number | null
  rating: number
  tags: string[]
  tips: string | null
  isPublished: boolean
  isFeatured: boolean
  coverPhotoUrl: string
}>): Promise<Trip> {
  const ref = adminDb.collection('trips').doc(id)

  const updateData: any = { ...data, updatedAt: Timestamp.now() }

  // Handle date conversion
  if ('dateFrom' in data) {
    updateData.dateFrom = data.dateFrom ? Timestamp.fromDate(new Date(data.dateFrom)) : null
  }
  if ('dateTo' in data) {
    updateData.dateTo = data.dateTo ? Timestamp.fromDate(new Date(data.dateTo)) : null
  }

  // If destinationSlug changed, update denormalized destination object
  if (data.destinationSlug) {
    const destDoc = await adminDb.collection('destinations').doc(data.destinationSlug).get()
    if (destDoc.exists) {
      const dest = docToDestination(destDoc)
      updateData.destination = {
        id: dest.slug,
        slug: dest.slug,
        name: dest.name,
        type: dest.type,
        region: dest.region,
        accentColor: dest.accentColor,
      }
    }
  }

  await ref.update(updateData)
  return getTripById(id) as Promise<Trip>
}

export async function deleteTrip(id: string): Promise<void> {
  // Delete photos subcollection first
  const photosSnap = await adminDb.collection('trips').doc(id).collection('photos').get()
  const batch = adminDb.batch()
  for (const doc of photosSnap.docs) {
    batch.delete(doc.ref)
  }
  batch.delete(adminDb.collection('trips').doc(id))
  await batch.commit()
}

// ─── Photos ───────────────────────────────────────────────────────────────────

export async function getPhotos(tripId: string): Promise<Photo[]> {
  const snap = await adminDb.collection('trips').doc(tripId).collection('photos').orderBy('sortOrder').get()
  return snap.docs.map(d => docToPhoto(d, tripId))
}

export async function getPhotoById(tripId: string, photoId: string): Promise<Photo | null> {
  const doc = await adminDb.collection('trips').doc(tripId).collection('photos').doc(photoId).get()
  if (!doc.exists) return null
  return docToPhoto(doc, tripId)
}

export async function createPhoto(tripId: string, data: {
  url: string
  caption?: string
  sortOrder?: number
  isCoverPhoto?: boolean
}): Promise<Photo> {
  if (data.isCoverPhoto) {
    await unsetCoverPhotos(tripId)
  }

  const ref = await adminDb.collection('trips').doc(tripId).collection('photos').add({
    url: data.url,
    caption: data.caption ?? null,
    sortOrder: data.sortOrder ?? 0,
    isCoverPhoto: data.isCoverPhoto ?? false,
  })

  // If this is the first/cover photo, update the trip's coverPhotoUrl
  if (data.isCoverPhoto || data.sortOrder === 0) {
    await adminDb.collection('trips').doc(tripId).update({
      coverPhotoUrl: data.url,
      updatedAt: Timestamp.now(),
    })
  }

  const doc = await ref.get()
  return docToPhoto(doc, tripId)
}

export async function updatePhoto(tripId: string, photoId: string, data: Partial<{
  caption: string | null
  sortOrder: number
  isCoverPhoto: boolean
}>): Promise<Photo> {
  const ref = adminDb.collection('trips').doc(tripId).collection('photos').doc(photoId)

  if (data.isCoverPhoto) {
    await unsetCoverPhotos(tripId)
    // Update trip's coverPhotoUrl
    const doc = await ref.get()
    if (doc.exists) {
      await adminDb.collection('trips').doc(tripId).update({
        coverPhotoUrl: doc.data()!.url,
        updatedAt: Timestamp.now(),
      })
    }
  }

  await ref.update(data)
  const doc = await ref.get()
  return docToPhoto(doc, tripId)
}

export async function deletePhoto(tripId: string, photoId: string): Promise<Photo> {
  const ref = adminDb.collection('trips').doc(tripId).collection('photos').doc(photoId)
  const doc = await ref.get()
  if (!doc.exists) throw new Error('Photo not found')
  const photo = docToPhoto(doc, tripId)
  await ref.delete()

  // If this was the cover photo, update coverPhotoUrl on the trip
  if (photo.isCoverPhoto) {
    const remaining = await adminDb
      .collection('trips').doc(tripId)
      .collection('photos').orderBy('sortOrder').limit(1).get()

    const newCoverUrl = remaining.empty ? '' : remaining.docs[0].data().url
    await adminDb.collection('trips').doc(tripId).update({
      coverPhotoUrl: newCoverUrl,
      updatedAt: Timestamp.now(),
    })

    if (!remaining.empty) {
      await remaining.docs[0].ref.update({ isCoverPhoto: true })
    }
  }

  return photo
}

export async function unsetCoverPhotos(tripId: string): Promise<void> {
  const snap = await adminDb
    .collection('trips').doc(tripId)
    .collection('photos').where('isCoverPhoto', '==', true).get()

  const batch = adminDb.batch()
  for (const doc of snap.docs) {
    batch.update(doc.ref, { isCoverPhoto: false })
  }
  await batch.commit()
}

// ─── Site Settings ────────────────────────────────────────────────────────────

const SETTINGS_DOC = 'settings/site'

const defaultSettings = {
  aboutTitle: 'Every State. Every Story.',
  aboutText: "I'm Rishi, and I'm on a mission to visit every single state and union territory of India — not as a tourist ticking boxes, but as a traveler who actually stays, eats, wanders, and comes back with something to say.\n\nThis isn't a travel blog in the traditional sense. It's a diary. A record of what I spent, what I saw, what I'd tell a first-timer, and what made each place worth the journey. The good, the expensive, the chaotic, and the quietly beautiful.\n\nIndia has 28 states and 8 union territories — 36 in total. I'm going through every one. Come along for the ride.",
  socialLinks: { instagram: '', twitter: '', youtube: '', email: '' },
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await adminDb.doc(SETTINGS_DOC).get()
  if (!doc.exists) {
    // Create defaults
    const now = Timestamp.now()
    await adminDb.doc(SETTINGS_DOC).set({ ...defaultSettings, updatedAt: now })
    return {
      id: 'site',
      ...defaultSettings,
      updatedAt: now.toDate().toISOString(),
    }
  }
  const d = doc.data()!
  return {
    id: 'site',
    aboutTitle: d.aboutTitle ?? defaultSettings.aboutTitle,
    aboutText: d.aboutText ?? defaultSettings.aboutText,
    socialLinks: d.socialLinks ?? defaultSettings.socialLinks,
    updatedAt: timestampToISO(d.updatedAt) ?? new Date().toISOString(),
  }
}

export async function upsertSiteSettings(data: Partial<{
  aboutTitle: string
  aboutText: string
  socialLinks: Record<string, string>
}>): Promise<SiteSettings> {
  await adminDb.doc(SETTINGS_DOC).set(
    { ...data, updatedAt: Timestamp.now() },
    { merge: true }
  )
  return getSiteSettings()
}

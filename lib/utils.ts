/**
 * Converts a string to a URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Formats a number as Indian currency
 */
export function formatCost(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formats a date nicely
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Formats a date range
 */
export function formatDateRange(
  from: Date | string | null | undefined,
  to: Date | string | null | undefined
): string {
  if (!from) return ''
  const fromDate = new Date(from)
  const toDate = to ? new Date(to) : null

  if (!toDate || fromDate.toDateString() === toDate.toDateString()) {
    return formatDate(fromDate)
  }

  const fromStr = fromDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
  const toStr = toDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${fromStr} – ${toStr}`
}

/**
 * Renders star rating as string
 */
export function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

/**
 * Safely parse JSON with a fallback
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Cost breakdown type
 */
export interface CostBreakdown {
  travel: number
  stay: number
  food: number
  activities: number
  misc: number
}

export const EMPTY_COST_BREAKDOWN: CostBreakdown = {
  travel: 0,
  stay: 0,
  food: 0,
  activities: 0,
  misc: 0,
}

/**
 * Indian regions list
 */
export const INDIA_REGIONS = [
  'North India',
  'South India',
  'East India',
  'West India',
  'Northeast India',
  'Central India',
]

/**
 * Common travel tags
 */
export const COMMON_TAGS = [
  'solo',
  'budget',
  'backpacking',
  'luxury',
  'family',
  'couple',
  'trekking',
  'beach',
  'mountains',
  'food',
  'heritage',
  'nature',
  'adventure',
  'spiritual',
  'wildlife',
  'offbeat',
  'roadtrip',
  'monsoon',
  'winter',
  'summer',
]

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

/**
 * Generate trip slug from placeName + destination slug
 */
export function generateTripSlug(placeName: string, destinationSlug: string, year?: number): string {
  const yearSuffix = year ? `-${year}` : ''
  return `${destinationSlug}-${slugify(placeName)}${yearSuffix}`
}

/**
 * Get cover photo URL from an array of photos
 */
export function getCoverPhoto(photos: Array<{ url: string; isCoverPhoto: boolean }>): string | null {
  if (!photos || photos.length === 0) return null
  const cover = photos.find(p => p.isCoverPhoto)
  return cover?.url ?? photos[0]?.url ?? null
}

/**
 * Format duration
 */
export function formatDuration(days: number | null | undefined): string {
  if (!days) return ''
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  const weeks = Math.floor(days / 7)
  const remaining = days % 7
  if (remaining === 0) return `${weeks} week${weeks > 1 ? 's' : ''}`
  return `${weeks}w ${remaining}d`
}

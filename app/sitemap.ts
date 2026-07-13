import { MetadataRoute } from 'next'
import { getDestinations, getTrips } from '@/lib/firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const [destinations, trips] = await Promise.all([
    getDestinations(),
    getTrips({ publishedOnly: true }),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/journeys`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const destPages: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${baseUrl}/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const tripPages: MetadataRoute.Sitemap = trips.map((t) => ({
    url: `${baseUrl}/${t.destination.slug}/${t.slug}`,
    lastModified: new Date(t.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...destPages, ...tripPages]
}

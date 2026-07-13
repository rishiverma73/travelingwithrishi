import type { Metadata } from 'next'
import { getTrips } from '@/lib/firebase/firestore'
import { INDIA_REGIONS, COMMON_TAGS } from '@/lib/utils'
import { JourneysClient } from './JourneysClient'

export const metadata: Metadata = {
  title: 'All Journeys',
  description: 'Every trip logged across every state and union territory of India.',
}

export const dynamic = 'force-dynamic'

export default async function JourneysPage() {
  const trips = await getTrips({
    publishedOnly: true,
    includePhotos: true,
  })

  return (
    <div>
      <section className="py-20 px-4 sm:px-6 grain-overlay bg-forest">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="font-data text-gold text-xs tracking-widest uppercase">Portfolio</span>
          </div>
          <h1 className="font-fraunces text-5xl sm:text-6xl text-cream mb-4 leading-tight">
            All Journeys
          </h1>
          <p className="text-cream-muted max-w-lg">
            {trips.length} {trips.length === 1 ? 'story' : 'stories'} across India. Filters below — use them or just scroll.
          </p>
        </div>
      </section>

      <JourneysClient trips={trips as any} regions={INDIA_REGIONS} tags={COMMON_TAGS} />
    </div>
  )
}

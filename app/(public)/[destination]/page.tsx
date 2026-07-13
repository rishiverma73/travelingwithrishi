import { getDestinationWithTrips, getDestinationBySlug } from '@/lib/firebase/firestore'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TripCard } from '@/components/public/TripCard'
import { formatCost } from '@/lib/utils'
import { MapPin, BookOpen, IndianRupee, Star, Compass } from 'lucide-react'

interface Props {
  params: { destination: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const destination = await getDestinationBySlug(params.destination)
  if (!destination) return {}
  return {
    title: destination.name,
    description: `All trips and stories from ${destination.name}${destination.region ? `, ${destination.region}` : ''}.`,
    openGraph: { title: `${destination.name} | Traveling With Rishi` },
  }
}

export const dynamic = 'force-dynamic'

export default async function DestinationPage({ params }: Props) {
  const destination = await getDestinationWithTrips(params.destination)

  if (!destination) notFound()

  const trips = destination.trips
  const totalSpent = trips.reduce((s, t) => s + t.totalCost, 0)
  const avgRating = trips.length
    ? (trips.reduce((s, t) => s + t.rating, 0) / trips.length).toFixed(1)
    : null

  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 px-4 sm:px-6 grain-overlay relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0D1F1A 0%, ${destination.accentColor}20 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: destination.accentColor }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-cream-dim text-sm mb-6">
            <a href="/" className="hover:text-cream transition-colors">Home</a>
            <span>/</span>
            <span className="text-cream-muted">{destination.name}</span>
          </div>

          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{ color: destination.accentColor, borderColor: destination.accentColor + '50' }}
            >
              <MapPin size={11} />
              {destination.type === 'STATE'
                ? 'State'
                : destination.type === 'UNION_TERRITORY'
                ? 'Union Territory'
                : 'Country'}
              {destination.region && ` · ${destination.region}`}
            </span>
          </div>

          <h1 className="font-fraunces text-5xl sm:text-6xl text-cream mb-6 leading-tight">
            {destination.name}
          </h1>

          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-cream-dim" />
              <span className="font-data text-sm text-cream-muted">
                {trips.length} trip{trips.length !== 1 ? 's' : ''} logged
              </span>
            </div>
            {totalSpent > 0 && (
              <div className="flex items-center gap-2">
                <IndianRupee size={16} className="text-cream-dim" />
                <span className="font-data text-sm text-cream-muted">
                  {formatCost(totalSpent)} total spent
                </span>
              </div>
            )}
            {avgRating && (
              <div className="flex items-center gap-2">
                <Star size={16} className="text-gold" />
                <span className="font-data text-sm text-cream-muted">
                  {avgRating} avg rating
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trips */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {trips.length === 0 ? (
            // Not visited yet state
            <div className="text-center py-24 max-w-md mx-auto">
              <div className="w-20 h-20 border-2 border-dashed border-cream-dim/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass size={32} className="text-cream-dim/40" />
              </div>
              <h2 className="font-fraunces text-3xl text-cream mb-3">Not Yet Visited</h2>
              <p className="text-cream-muted leading-relaxed">
                {destination.name} is on the list. No stories here yet — but they're coming.
                Check back after the next adventure.
              </p>
              <div className="mt-8 flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center"
                  style={{ borderColor: destination.accentColor + '60' }}
                >
                  <MapPin size={20} style={{ color: destination.accentColor }} />
                </div>
                <span className="font-data text-xs tracking-widest uppercase text-cream-dim">
                  Coming Soon
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-fraunces text-3xl text-cream">
                  Stories from {destination.name}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip, i) => (
                  <TripCard key={trip.id} trip={trip as any} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

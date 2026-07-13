import { getTripBySlug, getTrips } from '@/lib/firebase/firestore'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PhotoGallery } from '@/components/public/PhotoGallery'
import { CostBreakdownChart } from '@/components/public/CostBreakdownChart'
import { TripCard } from '@/components/public/TripCard'
import {
  formatCost, formatDateRange, formatDuration, renderStars
} from '@/lib/utils'
import { MapPin, Calendar, Clock, IndianRupee, Tag, Lightbulb, ChevronRight } from 'lucide-react'

interface Props {
  params: { destination: string; trip: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trip = await getTripBySlug(params.trip)
  if (!trip) return {}
  return {
    title: `${trip.placeName}, ${trip.destination.name}`,
    description: trip.description.slice(0, 160),
    openGraph: {
      title: `${trip.placeName} | Traveling With Rishi`,
      description: trip.bestPart || trip.description.slice(0, 160),
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function TripDetailPage({ params }: Props) {
  const trip = await getTripBySlug(params.trip, true /* publishedOnly */)

  if (!trip) notFound()

  // costBreakdown is now a native Firestore map — no JSON parsing needed
  const costBreakdown = trip.costBreakdown
  const tags = trip.tags  // native array

  const hasBreakdown = Object.values(costBreakdown).some(v => v > 0)

  // More trips from same destination
  const allFromDest = await getTrips({
    destinationSlug: trip.destinationSlug,
    publishedOnly: true,
    includePhotos: true,
    limit: 4,
  })
  const moreTrips = allFromDest.filter(t => t.id !== trip.id).slice(0, 3)

  return (
    <div>
      {/* Hero photo */}
      <section className="relative h-[50vh] min-h-[320px] overflow-hidden">
        {trip.photos && trip.photos[0] ? (
          <>
            <img
              src={trip.photos.find(p => p.isCoverPhoto)?.url || trip.photos[0].url}
              alt={trip.placeName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest/20 to-forest" />
          </>
        ) : (
          <div
            className="w-full h-full grain-overlay"
            style={{ background: `linear-gradient(135deg, #0D1F1A 0%, ${trip.destination.accentColor}30 100%)` }}
          />
        )}

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-cream-dim text-sm mb-3">
              <a href="/" className="hover:text-cream transition-colors">Home</a>
              <span>/</span>
              <a href={`/${trip.destination.slug}`} className="hover:text-cream transition-colors">
                {trip.destination.name}
              </a>
              <span>/</span>
              <span className="text-cream-muted">{trip.placeName}</span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                style={{ background: trip.destination.accentColor }}
              >
                <MapPin size={10} />
                {trip.destination.name}
              </span>
              <span className="text-gold text-sm">{'★'.repeat(trip.rating)}</span>
            </div>

            <h1 className="font-fraunces text-4xl sm:text-5xl text-cream leading-tight">
              {trip.placeName}
            </h1>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Meta strip */}
        <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-gold/10">
          {trip.dateFrom && (
            <div className="flex items-center gap-2 text-cream-muted text-sm">
              <Calendar size={15} className="text-gold" />
              <span className="font-data">{formatDateRange(trip.dateFrom, trip.dateTo)}</span>
            </div>
          )}
          {trip.durationDays && (
            <div className="flex items-center gap-2 text-cream-muted text-sm">
              <Clock size={15} className="text-gold" />
              <span className="font-data">{formatDuration(trip.durationDays)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-cream-muted text-sm">
            <IndianRupee size={15} className="text-gold" />
            <span className="font-data font-semibold text-rust-light">
              {formatCost(trip.totalCost, trip.currency)}
            </span>
          </div>
          {trip.cityRegion && (
            <div className="flex items-center gap-2 text-cream-muted text-sm">
              <MapPin size={15} className="text-gold" />
              <span>{trip.cityRegion}</span>
            </div>
          )}
        </div>

        {/* Photo gallery */}
        {trip.photos && trip.photos.length > 1 && (
          <div className="mb-10">
            <PhotoGallery photos={trip.photos} />
          </div>
        )}

        {/* Story */}
        <div className="parchment-panel rounded-2xl p-8 sm:p-10 mb-10">
          <div className="prose prose-stone max-w-none">
            {trip.description.split('\n\n').map((para, i) => (
              <p key={i} className="font-inter text-[#3A2E1E] leading-relaxed mb-4 text-base">
                {para}
              </p>
            ))}
          </div>

          {/* Best part */}
          {trip.bestPart && (
            <div className="mt-8 pt-6 border-t border-[#C9972C]/20">
              <div className="text-xs font-data uppercase tracking-widest text-[#9B7A4A] mb-2">
                Best Part
              </div>
              <blockquote className="relative">
                <span className="absolute -top-4 -left-2 text-[#C9972C]/30 font-fraunces text-6xl leading-none">"</span>
                <p className="font-caveat text-2xl text-[#7B4A1F] italic leading-snug pl-4">
                  {trip.bestPart}
                </p>
              </blockquote>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-3 mb-10 flex-wrap">
            <Tag size={14} className="text-cream-dim" />
            {tags.map(tag => (
              <span
                key={tag}
                className="text-sm px-3 py-1 rounded-full border border-cream-dim/20 text-cream-muted hover:border-gold/40 hover:text-gold transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Cost breakdown */}
        {(hasBreakdown || trip.totalCost > 0) && (
          <section className="parchment-panel rounded-2xl p-8 mb-10">
            <h2 className="font-fraunces text-2xl text-[#2A1F0E] mb-6">
              Cost Breakdown
              <span className="ml-3 font-data text-base font-normal text-[#9B3A2A]">
                {formatCost(trip.totalCost, trip.currency)} total
              </span>
            </h2>

            {hasBreakdown ? (
              <CostBreakdownChart
                breakdown={costBreakdown}
                total={trip.totalCost}
                currency={trip.currency}
              />
            ) : (
              <div className="text-center py-6 text-[#9B8A70] text-sm">
                <p>Total: {formatCost(trip.totalCost, trip.currency)}</p>
                <p className="text-xs mt-1">No itemized breakdown available.</p>
              </div>
            )}
          </section>
        )}

        {/* Tips */}
        {trip.tips && (
          <section className="bg-forest-light border border-gold/15 rounded-2xl p-8 mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-gold" />
              <h2 className="font-fraunces text-xl text-cream">Tips for First-Timers</h2>
            </div>
            <div className="space-y-2">
              {trip.tips.split('\n').filter(Boolean).map((tip, i) => (
                <div key={i} className="flex gap-3 text-cream-muted text-sm">
                  <span className="font-data text-gold shrink-0 w-4">{i + 1}.</span>
                  <span>{tip.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* More from destination */}
        {moreTrips.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-fraunces text-2xl text-cream">
                More from {trip.destination.name}
              </h2>
              <a
                href={`/${trip.destination.slug}`}
                className="text-gold text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                All trips <ChevronRight size={14} />
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreTrips.map((t, i) => (
                <TripCard key={t.id} trip={t as any} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

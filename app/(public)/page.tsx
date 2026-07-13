import type { Metadata } from 'next'
import { getDestinations, getTrips, getTripAggregate, getSiteSettings } from '@/lib/firebase/firestore'
import Link from 'next/link'
import { PassportWall } from '@/components/public/PassportWall'
import { TripCard } from '@/components/public/TripCard'
import { formatCost, getCoverPhoto } from '@/lib/utils'
import { Compass, MapPin, BookOpen, IndianRupee, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Traveling With Rishi — Chasing Every State of India',
  description:
    'A personal travel diary chasing every state and union territory of India — one story at a time.',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [destinations, recentTrips, featuredTrips, settings, aggregate] = await Promise.all([
    getDestinations({ withTripCounts: true }),
    getTrips({ publishedOnly: true, limit: 6, includePhotos: true }),
    getTrips({ publishedOnly: true, featured: true, limit: 1, includePhotos: true }),
    getSiteSettings(),
    getTripAggregate(true),
  ])

  const featuredTrip = featuredTrips[0] ?? null

  const visitedCount = destinations.filter((d: any) => (d.trips?.length ?? 0) > 0).length
  const totalTrips = aggregate.count
  const totalSpent = aggregate.totalSpent
  const coveragePercent = Math.round((visitedCount / 36) * 100)

  const featuredCover = featuredTrip ? getCoverPhoto(featuredTrip.photos ?? []) : null

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-center grain-overlay overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-rust/5 rounded-full blur-3xl" />
          {/* Decorative compass lines */}
          <svg className="absolute top-20 right-10 opacity-5 w-64 h-64" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#C9972C" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#C9972C" strokeWidth="0.5" />
            <line x1="100" y1="20" x2="100" y2="180" stroke="#C9972C" strokeWidth="0.5" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="#C9972C" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-gold" />
              <span className="font-data text-gold text-xs tracking-widest uppercase">
                A Travel Diary
              </span>
            </div>

            {/* Main headline */}
            <h1 className="font-fraunces text-5xl sm:text-6xl md:text-7xl text-cream leading-[1.05] mb-6">
              Chasing Every<br />
              <em className="italic text-gold">State of India,</em><br />
              One Story at a Time.
            </h1>

            {/* Mission statement */}
            <p className="text-cream-muted text-lg leading-relaxed max-w-xl mb-10">
              India has 28 states and 8 union territories — 36 in total. I'm going through every one.
              Not as a tourist ticking boxes, but as a traveler who stays, eats, wanders, and comes back with something to say.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="#passport-wall"
                className="btn-primary px-6 py-3 text-base flex items-center gap-2"
              >
                <MapPin size={18} />
                See the Passport Wall
              </Link>
              <Link
                href="/journeys"
                className="btn-secondary px-6 py-3 text-base flex items-center gap-2"
              >
                <BookOpen size={18} />
                All Journeys
              </Link>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-gold/10 rounded-2xl overflow-hidden border border-gold/10">
            {[
              { label: 'States & UTs Visited', value: `${visitedCount}/36`, unit: 'destinations' },
              { label: 'Trips Logged', value: totalTrips, unit: 'journeys' },
              { label: 'Total Spent', value: formatCost(totalSpent), unit: 'across all trips' },
              { label: 'India Covered', value: `${coveragePercent}%`, unit: 'of the map' },
            ].map(stat => (
              <div key={stat.label} className="bg-forest-light p-6 text-center">
                <div className="font-fraunces text-3xl sm:text-4xl text-gold mb-1">{stat.value}</div>
                <div className="font-data text-xs text-cream-muted uppercase tracking-wider">{stat.label}</div>
                <div className="text-cream-dim text-xs mt-0.5">{stat.unit}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6 mb-24">
            <div className="flex items-center justify-between text-xs font-data text-cream-muted mb-2">
              <span>INDIA COVERAGE</span>
              <span className="text-gold">{coveragePercent}%</span>
            </div>
            <div className="h-1.5 bg-forest-light rounded-full border border-gold/10">
              <div
                className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED JOURNEY ═══════════════ */}
      {featuredTrip && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-gold" />
              <span className="font-data text-gold text-xs tracking-widest uppercase">Featured Journey</span>
            </div>

            <Link href={`/${featuredTrip.destination.slug}/${featuredTrip.slug}`}>
              <article className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gold/20 shadow-card hover:border-gold/40 transition-all group cursor-pointer">
                {/* Photo side */}
                <div className="aspect-[4/3] md:aspect-auto relative overflow-hidden min-h-[300px]">
                  {featuredCover ? (
                    <img
                      src={featuredCover}
                      alt={featuredTrip.placeName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-forest-light flex items-center justify-center">
                      <Compass size={48} className="text-gold/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-forest/30" />
                </div>

                {/* Content side — parchment */}
                <div className="parchment-panel p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: featuredTrip.destination.accentColor }}
                      >
                        <MapPin size={10} />
                        {featuredTrip.destination.name}
                      </span>
                      <span className="text-[#9B3A2A] text-xs font-data">
                        {'★'.repeat(featuredTrip.rating)}
                      </span>
                    </div>

                    <h2 className="font-fraunces text-3xl md:text-4xl text-[#2A1F0E] mb-3 leading-tight">
                      {featuredTrip.placeName}
                    </h2>

                    <p className="text-[#4A3828] leading-relaxed mb-6 text-sm">
                      {featuredTrip.description.slice(0, 280)}…
                    </p>

                    {featuredTrip.bestPart && (
                      <blockquote className="border-l-2 border-[#C9972C] pl-4 mb-6">
                        <p className="font-caveat text-xl text-[#7B4A1F] italic leading-snug">
                          "{featuredTrip.bestPart}"
                        </p>
                      </blockquote>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-data text-sm text-[#9B3A2A] font-semibold">
                      {formatCost(featuredTrip.totalCost, featuredTrip.currency)}
                    </div>
                    <span className="flex items-center gap-1 text-[#C9972C] text-sm font-semibold group-hover:gap-2 transition-all">
                      Read the story <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════ PASSPORT WALL ═══════════════ */}
      <section id="passport-wall" className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold" />
            <span className="font-data text-gold text-xs tracking-widest uppercase">The Passport Wall</span>
          </div>
          <h2 className="font-fraunces text-4xl text-cream mb-2">Every Destination</h2>
          <p className="text-cream-muted mb-10 max-w-xl">
            36 states and union territories. The filled-in tiles are the ones with stories. The dashed ones are next.
          </p>

          <PassportWall destinations={destinations as any} />
        </div>
      </section>

      {/* ═══════════════ LATEST ENTRIES ═══════════════ */}
      {recentTrips.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px w-8 bg-gold" />
                  <span className="font-data text-gold text-xs tracking-widest uppercase">Latest Entries</span>
                </div>
                <h2 className="font-fraunces text-4xl text-cream">Most Recent Journeys</h2>
              </div>
              <Link
                href="/journeys"
                className="text-gold text-sm flex items-center gap-1 hover:gap-2 transition-all"
              >
                All journeys <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTrips.map((trip: any, i: number) => (
                <TripCard key={trip.id} trip={trip as any} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ EMPTY STATE CALL TO ACTION ═══════════════ */}
      {recentTrips.length === 0 && (
        <section className="py-24 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Compass size={28} className="text-gold" />
            </div>
            <h2 className="font-fraunces text-3xl text-cream mb-3">The Journey Begins</h2>
            <p className="text-cream-muted mb-6">
              No trips logged yet — but the Passport Wall is ready. Add your first journey from the admin dashboard.
            </p>
            <Link href="/admin" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              Go to Admin Dashboard
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

import { getTrips, getDestinations } from '@/lib/firebase/firestore'
import { formatCost } from '@/lib/utils'
import Link from 'next/link'
import {
  MapPin,
  BookOpen,
  DollarSign,
  Star,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { AdminSpendChart } from '@/components/admin/AdminSpendChart'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [allDestinations, allTrips] = await Promise.all([
    getDestinations({ withTripCounts: true }),
    getTrips({ includePhotos: false }),
  ])

  const publishedTrips = allTrips.filter(t => t.isPublished)
  const visitedDestinations = allDestinations.filter((d: any) => (d.trips?.length ?? 0) > 0)
  const emptyDestinations = allDestinations.filter((d: any) => (d.trips?.length ?? 0) === 0)

  const totalSpent = publishedTrips.reduce((sum, t) => sum + t.totalCost, 0)

  const mostExpensive = publishedTrips.reduce(
    (max, t) => (t.totalCost > (max?.totalCost ?? 0) ? t : max),
    null as any
  )

  const highestRated = publishedTrips.reduce(
    (max, t) => (t.rating > (max?.rating ?? 0) ? t : max),
    null as any
  )

  // Aggregate cost breakdown across all trips
  const totalBreakdown = { travel: 0, stay: 0, food: 0, activities: 0, misc: 0 }
  for (const trip of publishedTrips) {
    const bd = trip.costBreakdown  // native Firestore map — no JSON.parse needed
    totalBreakdown.travel += bd.travel || 0
    totalBreakdown.stay += bd.stay || 0
    totalBreakdown.food += bd.food || 0
    totalBreakdown.activities += bd.activities || 0
    totalBreakdown.misc += bd.misc || 0
  }

  const recentTrips = allTrips.slice(0, 5)

  const statsCards = [
    {
      label: 'Destinations Visited',
      value: `${visitedDestinations.length} / ${allDestinations.length}`,
      sub: 'Indian states & UTs',
      icon: MapPin,
      color: 'text-sage',
      bg: 'bg-sage/10',
    },
    {
      label: 'Trips Logged',
      value: allTrips.length,
      sub: `${publishedTrips.length} published`,
      icon: BookOpen,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
    {
      label: 'Total Spent',
      value: formatCost(totalSpent),
      sub: 'across all trips',
      icon: DollarSign,
      color: 'text-rust-light',
      bg: 'bg-rust/10',
    },
    {
      label: 'Average Rating',
      value: publishedTrips.length
        ? (publishedTrips.reduce((s, t) => s + t.rating, 0) / publishedTrips.length).toFixed(1)
        : '—',
      sub: 'out of 5 stars',
      icon: Star,
      color: 'text-gold',
      bg: 'bg-gold/10',
    },
  ]

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl text-cream mb-1">Dashboard</h1>
        <p className="text-cream-muted text-sm">Your journey at a glance.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map(card => (
          <div key={card.label} className="bg-forest-light border border-gold/10 rounded-xl p-5">
            <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <div className="font-data text-2xl font-bold text-cream mb-0.5">{card.value}</div>
            <div className="text-xs text-cream-muted">{card.label}</div>
            <div className="text-xs text-cream-dim mt-0.5">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-forest-light border border-gold/10 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-semibold text-cream">India Coverage</span>
            <span className="text-cream-muted text-xs ml-2">
              {visitedDestinations.length} of 36 states & UTs visited
            </span>
          </div>
          <span className="font-data text-gold text-sm font-bold">
            {Math.round((visitedDestinations.length / 36) * 100)}%
          </span>
        </div>
        <div className="h-2.5 bg-forest rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-1000"
            style={{ width: `${(visitedDestinations.length / 36) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Spend breakdown chart */}
        <div className="bg-forest-light border border-gold/10 rounded-xl p-5">
          <h2 className="font-fraunces text-lg text-cream mb-4">Spend Breakdown</h2>
          <AdminSpendChart data={totalBreakdown} />
        </div>

        {/* Top trips */}
        <div className="bg-forest-light border border-gold/10 rounded-xl p-5">
          <h2 className="font-fraunces text-lg text-cream mb-4">Highlights</h2>
          <div className="space-y-4">
            {mostExpensive && (
              <div className="border-l-2 border-rust pl-4">
                <div className="text-xs text-cream-muted uppercase tracking-wider mb-0.5 font-data">Most Expensive</div>
                <div className="text-cream text-sm font-semibold">{mostExpensive.placeName}</div>
                <div className="text-cream-dim text-xs">{mostExpensive.destination.name} · {formatCost(mostExpensive.totalCost)}</div>
              </div>
            )}
            {highestRated && (
              <div className="border-l-2 border-gold pl-4">
                <div className="text-xs text-cream-muted uppercase tracking-wider mb-0.5 font-data">Highest Rated</div>
                <div className="text-cream text-sm font-semibold">{highestRated.placeName}</div>
                <div className="text-cream-dim text-xs">{highestRated.destination.name} · {'★'.repeat(highestRated.rating)}</div>
              </div>
            )}
            {!mostExpensive && !highestRated && (
              <p className="text-cream-dim text-sm">No published trips yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent trips */}
        <div className="bg-forest-light border border-gold/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-fraunces text-lg text-cream">Recent Entries</h2>
            <Link href="/admin/trips/new" className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Plus size={13} />
              Add Trip
            </Link>
          </div>
          <div className="space-y-2">
            {allTrips.length === 0 && (
              <p className="text-cream-dim text-sm">No trips added yet.</p>
            )}
            {allTrips.map(trip => (
              <Link
                key={trip.id}
                href={`/admin/trips/${trip.id}/edit`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="text-sm text-cream group-hover:text-gold transition-colors truncate">
                    {trip.placeName}
                  </div>
                  <div className="text-xs text-cream-dim">{trip.destination.name}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    trip.isPublished
                      ? 'bg-sage/15 text-sage-light'
                      : 'bg-cream-dim/15 text-cream-dim'
                  }`}>
                    {trip.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Gap destinations */}
        <div className="bg-forest-light border border-gold/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-gold" />
            <h2 className="font-fraunces text-lg text-cream">Still To Visit</h2>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {emptyDestinations.slice(0, 15).map((dest: any) => (
              <div key={dest.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-cream-muted">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dest.accentColor }}
                />
                {dest.name}
                <span className="text-cream-dim text-xs ml-auto">{dest.region}</span>
              </div>
            ))}
            {emptyDestinations.length > 15 && (
              <div className="text-xs text-cream-dim px-2 pt-2">
                +{emptyDestinations.length - 15} more destinations
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

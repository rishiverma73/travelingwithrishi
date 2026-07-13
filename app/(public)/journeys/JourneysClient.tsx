'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { TripCard } from '@/components/public/TripCard'
import { safeJsonParse } from '@/lib/utils'
import { Filter, X } from 'lucide-react'

interface Trip {
  id: string
  placeName: string
  slug: string
  cityRegion: string | null
  description: string
  bestPart: string | null
  totalCost: number
  currency: string
  dateFrom: string | null
  dateTo: string | null
  rating: number
  tags: string
  isPublished: boolean
  destination: {
    id: string
    name: string
    slug: string
    accentColor: string
    region: string | null
  }
  photos: Array<{ url: string; isCoverPhoto: boolean }>
}

export function JourneysClient({
  trips,
  regions,
  tags: allTags,
}: {
  trips: Trip[]
  regions: string[]
  tags: string[]
}) {
  const searchParams = useSearchParams()
  const initialRegion = searchParams.get('region') || 'all'

  const [selectedRegion, setSelectedRegion] = useState(initialRegion)
  const [selectedRating, setSelectedRating] = useState(0)
  const [selectedTag, setSelectedTag] = useState('')
  const [costMax, setCostMax] = useState(200000)

  const filtered = useMemo(() => {
    return trips.filter(t => {
      if (selectedRegion !== 'all' && t.destination.region !== selectedRegion) return false
      if (selectedRating > 0 && t.rating < selectedRating) return false
      if (t.totalCost > costMax) return false
      if (selectedTag) {
        const tags = safeJsonParse<string[]>(t.tags, [])
        if (!tags.includes(selectedTag)) return false
      }
      return true
    })
  }, [trips, selectedRegion, selectedRating, costMax, selectedTag])

  const activeFilters = [
    selectedRegion !== 'all' && selectedRegion,
    selectedRating > 0 && `${selectedRating}+ stars`,
    selectedTag && selectedTag,
    costMax < 200000 && `< ₹${costMax.toLocaleString('en-IN')}`,
  ].filter(Boolean)

  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-forest-light border border-gold/10 rounded-2xl p-5 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={14} className="text-gold" />
            <span className="text-sm font-semibold text-cream-muted">Filter Journeys</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="admin-label">Region</label>
              <select
                className="admin-input"
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
              >
                <option value="all">All Regions</option>
                {regions.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="admin-label">Min Rating</label>
              <div className="flex gap-1">
                {[0, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRating(r)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedRating === r
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'bg-white/5 text-cream-muted hover:text-cream'
                    }`}
                  >
                    {r === 0 ? 'Any' : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="admin-label">Tag</label>
              <select
                className="admin-input"
                value={selectedTag}
                onChange={e => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="admin-label">Max Cost</label>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={costMax}
                onChange={e => setCostMax(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-xs text-cream-dim mt-1 font-data">
                {costMax >= 200000 ? 'Any budget' : `Up to ₹${costMax.toLocaleString('en-IN')}`}
              </div>
            </div>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-xs text-cream-dim">Active:</span>
              {activeFilters.map(f => (
                <span
                  key={String(f)}
                  className="flex items-center gap-1 text-xs bg-gold/15 text-gold px-2 py-0.5 rounded-full"
                >
                  {f}
                </span>
              ))}
              <button
                onClick={() => {
                  setSelectedRegion('all')
                  setSelectedRating(0)
                  setSelectedTag('')
                  setCostMax(200000)
                }}
                className="text-xs text-cream-dim hover:text-rust-light ml-1 flex items-center gap-1"
              >
                <X size={12} /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-cream-muted text-sm">
            Showing {filtered.length} of {trips.length} {trips.length === 1 ? 'journey' : 'journeys'}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-cream-muted text-lg mb-2">No journeys match these filters.</p>
            <button
              onClick={() => {
                setSelectedRegion('all')
                setSelectedRating(0)
                setSelectedTag('')
                setCostMax(200000)
              }}
              className="text-gold hover:underline text-sm"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

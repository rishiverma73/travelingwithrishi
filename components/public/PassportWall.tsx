'use client'

import { useState, useMemo } from 'react'
import { StampTile } from './StampTile'
import { Search, Filter } from 'lucide-react'

interface Destination {
  id: string
  name: string
  slug: string
  type: string
  region: string | null
  accentColor: string
  trips: Array<{ id: string; rating: number; photos: Array<{ url: string; isCoverPhoto: boolean }> }>
}

interface PassportWallProps {
  destinations: Destination[]
}

type FilterTab = 'all' | 'states' | 'uts' | 'countries' | 'visited'

export function PassportWall({ destinations }: PassportWallProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'states', label: 'States' },
    { id: 'uts', label: 'Union Territories' },
    { id: 'countries', label: 'Countries' },
    { id: 'visited', label: 'Visited' },
  ]

  const filtered = useMemo(() => {
    let result = destinations

    if (activeTab === 'states') result = result.filter(d => d.type === 'STATE')
    else if (activeTab === 'uts') result = result.filter(d => d.type === 'UNION_TERRITORY')
    else if (activeTab === 'countries') result = result.filter(d => d.type === 'COUNTRY')
    else if (activeTab === 'visited') result = result.filter(d => d.trips.length > 0)

    if (search) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.region || '').toLowerCase().includes(search.toLowerCase())
      )
    }

    return result
  }, [destinations, activeTab, search])

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {/* Tab filters */}
        <div className="flex flex-wrap gap-1 bg-forest-light/60 border border-gold/10 rounded-xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'text-cream-muted hover:text-cream'
              }`}
            >
              {tab.label}
              {tab.id === 'visited' && (
                <span className="ml-1.5 text-xs font-data">
                  ({destinations.filter(d => d.trips.length > 0).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-dim" />
          <input
            type="text"
            placeholder="Search destinations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input pl-8 text-sm py-2"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-cream-muted">No destinations found for "{search}"</p>
          <button onClick={() => { setSearch(''); setActiveTab('all') }} className="text-gold text-sm mt-2 hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* Stamp grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-10 gap-2">
        {filtered.map((destination, i) => (
          <StampTile key={destination.id} destination={destination} index={i} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-8 text-xs text-cream-dim">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gold/40 bg-forest-light" />
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dashed border-cream-dim/20" />
          <span>Yet to visit</span>
        </div>
      </div>
    </div>
  )
}

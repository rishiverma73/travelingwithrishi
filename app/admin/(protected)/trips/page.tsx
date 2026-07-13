'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Bookmark } from 'lucide-react'
import { formatCost, formatDate, safeJsonParse } from '@/lib/utils'

interface Trip {
  id: string
  placeName: string
  slug: string
  cityRegion: string | null
  totalCost: number
  currency: string
  dateFrom: string | null
  rating: number
  tags: string
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  destination: { id: string; name: string; slug: string }
  photos: { id: string; url: string; isCoverPhoto: boolean }[]
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all')

  async function fetchTrips() {
    const res = await fetch('/api/trips')
    const data = await res.json()
    setTrips(data)
    setLoading(false)
  }

  useEffect(() => { fetchTrips() }, [])

  async function togglePublish(id: string, current: boolean) {
    await fetch(`/api/trips/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    })
    setTrips(ts => ts.map(t => t.id === id ? { ...t, isPublished: !current } : t))
  }

  async function toggleFeature(id: string, current: boolean) {
    await fetch(`/api/trips/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !current }),
    })
    setTrips(ts => ts.map(t => t.id === id ? { ...t, isFeatured: !current } : t))
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch(`/api/trips/${id}`, { method: 'DELETE' })
    setTrips(ts => ts.filter(t => t.id !== id))
  }

  const filtered = trips.filter(t => {
    const matchSearch =
      !search ||
      t.placeName.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.name.toLowerCase().includes(search.toLowerCase()) ||
      safeJsonParse<string[]>(t.tags, []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchFilter =
      filterPublished === 'all' ||
      (filterPublished === 'published' && t.isPublished) ||
      (filterPublished === 'draft' && !t.isPublished)
    return matchSearch && matchFilter
  })

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-fraunces text-3xl text-cream mb-1">Trips</h1>
          <p className="text-cream-muted text-sm">
            {trips.length} total · {trips.filter(t => t.isPublished).length} published
          </p>
        </div>
        <Link href="/admin/trips/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search trips, destinations, tags…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-input max-w-xs"
        />
        <div className="flex gap-1 bg-forest-light border border-gold/10 rounded-lg p-1">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterPublished(f)}
              className={`px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                filterPublished === f
                  ? 'bg-gold/20 text-gold'
                  : 'text-cream-muted hover:text-cream'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Trip cards */}
      {loading ? (
        <div className="text-center text-cream-muted py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-cream-muted mb-3">No trips found</div>
          <Link href="/admin/trips/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Add your first trip
          </Link>
        </div>
      ) : (
        <div className="bg-forest-light border border-gold/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted">Trip</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted hidden md:table-cell">Destination</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted hidden lg:table-cell">Date</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted hidden sm:table-cell">Cost</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted">Rating</th>
                <th className="p-4 text-xs font-data uppercase tracking-wider text-cream-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(trip => {
                const cover = trip.photos.find(p => p.isCoverPhoto) || trip.photos[0]
                return (
                  <tr key={trip.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {cover ? (
                          <img src={cover.url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-forest shrink-0 flex items-center justify-center">
                            <Star size={14} className="text-cream-dim" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm text-cream font-medium truncate">{trip.placeName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {trip.isPublished ? (
                              <span className="text-xs bg-sage/15 text-sage-light px-1.5 py-0.5 rounded">Live</span>
                            ) : (
                              <span className="text-xs bg-cream-dim/10 text-cream-dim px-1.5 py-0.5 rounded">Draft</span>
                            )}
                            {trip.isFeatured && (
                              <span className="text-xs bg-gold/15 text-gold px-1.5 py-0.5 rounded">Featured</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-cream-muted text-sm">{trip.destination.name}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="font-data text-xs text-cream-dim">
                        {trip.dateFrom ? formatDate(trip.dateFrom) : '—'}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="font-data text-sm text-cream-muted">{formatCost(trip.totalCost)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gold text-sm">{'★'.repeat(trip.rating)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => togglePublish(trip.id, trip.isPublished)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            trip.isPublished
                              ? 'hover:bg-rust/10 text-sage hover:text-rust-light'
                              : 'hover:bg-sage/10 text-cream-dim hover:text-sage'
                          }`}
                          title={trip.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {trip.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => toggleFeature(trip.id, trip.isFeatured)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            trip.isFeatured
                              ? 'text-gold hover:bg-gold/10'
                              : 'text-cream-dim hover:text-gold hover:bg-gold/10'
                          }`}
                          title={trip.isFeatured ? 'Unfeature' : 'Feature on homepage'}
                        >
                          <Bookmark size={14} />
                        </button>
                        <Link
                          href={`/admin/trips/${trip.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-cream-muted hover:text-cream transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(trip.id, trip.placeName)}
                          className="p-1.5 rounded-lg hover:bg-rust/10 text-cream-muted hover:text-rust-light transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

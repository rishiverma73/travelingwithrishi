'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, X, MapPin, BookOpen } from 'lucide-react'
import { safeJsonParse, formatDate } from '@/lib/utils'

interface SearchResult {
  type: 'destination' | 'trip'
  id: string
  name: string
  subtitle: string
  href: string
  accentColor?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [destRes, tripRes] = await Promise.all([
          fetch(`/api/destinations?search=${encodeURIComponent(query)}`),
          fetch(`/api/trips?search=${encodeURIComponent(query)}&published=true`),
        ])

        const dests = await destRes.json()
        const trips = await tripRes.json()

        const destResults: SearchResult[] = (Array.isArray(dests) ? dests : [])
          .filter((d: any) =>
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            (d.region || '').toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .map((d: any) => ({
            type: 'destination' as const,
            id: d.id,
            name: d.name,
            subtitle: `${d.type === 'STATE' ? 'State' : d.type === 'UNION_TERRITORY' ? 'Union Territory' : 'Country'}${d.region ? ` · ${d.region}` : ''}`,
            href: `/${d.slug}`,
            accentColor: d.accentColor,
          }))

        const tripResults: SearchResult[] = (Array.isArray(trips) ? trips : [])
          .slice(0, 8)
          .map((t: any) => ({
            type: 'trip' as const,
            id: t.id,
            name: t.placeName,
            subtitle: `${t.destination?.name || ''} · ${t.dateFrom ? formatDate(t.dateFrom) : 'No date'}`,
            href: `/${t.destination?.slug}/${t.slug}`,
            accentColor: t.destination?.accentColor,
          }))

        setResults([...destResults, ...tripResults])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-fraunces text-4xl text-cream mb-2">Search</h1>
          <p className="text-cream-muted">Find destinations, trips, and stories.</p>
        </div>

        {/* Search input */}
        <div className="relative mb-8">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-dim" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search states, trips, tags…"
            className="admin-input pl-12 py-4 text-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-dim hover:text-cream"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center text-cream-muted py-8">Searching…</div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-cream-muted mb-2">No results for "{query}"</p>
            <p className="text-cream-dim text-sm">Try a state name, place, or tag like "beach" or "solo".</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {/* Destinations */}
            {results.filter(r => r.type === 'destination').length > 0 && (
              <div>
                <div className="text-xs font-data uppercase tracking-wider text-cream-dim mb-2 px-1">
                  Destinations
                </div>
                {results
                  .filter(r => r.type === 'destination')
                  .map(result => (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="flex items-center gap-4 p-4 rounded-xl bg-forest-light border border-gold/10 hover:border-gold/30 transition-all mb-2 group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${result.accentColor}25` }}
                      >
                        <MapPin size={16} style={{ color: result.accentColor }} />
                      </div>
                      <div>
                        <div className="text-cream font-semibold group-hover:text-gold transition-colors">
                          {result.name}
                        </div>
                        <div className="text-cream-dim text-xs">{result.subtitle}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}

            {/* Trips */}
            {results.filter(r => r.type === 'trip').length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-data uppercase tracking-wider text-cream-dim mb-2 px-1">
                  Trips
                </div>
                {results
                  .filter(r => r.type === 'trip')
                  .map(result => (
                    <Link
                      key={result.id}
                      href={result.href}
                      className="flex items-center gap-4 p-4 rounded-xl bg-forest-light border border-gold/10 hover:border-gold/30 transition-all mb-2 group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${result.accentColor}25` }}
                      >
                        <BookOpen size={16} style={{ color: result.accentColor }} />
                      </div>
                      <div>
                        <div className="text-cream font-semibold group-hover:text-gold transition-colors">
                          {result.name}
                        </div>
                        <div className="text-cream-dim text-xs">{result.subtitle}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gold/50" />
            </div>
            <p className="text-cream-dim">Start typing to search across destinations and trips.</p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, Globe } from 'lucide-react'

interface Destination {
  id: string
  name: string
  slug: string
  type: string
  region: string | null
  accentColor: string
  isCustom: boolean
  isDeletable: boolean
  trips: { id: string }[]
}

const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Northeast India', 'Central India', 'International']
const TYPES = [
  { value: 'STATE', label: 'State' },
  { value: 'UNION_TERRITORY', label: 'Union Territory' },
  { value: 'COUNTRY', label: 'Country' },
]

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    name: '', type: 'STATE', region: 'North India', accentColor: '#C9972C',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchDestinations() {
    const res = await fetch('/api/destinations?withTrips=false')
    const data = await res.json()
    setDestinations(data)
    setLoading(false)
  }

  useEffect(() => { fetchDestinations() }, [])

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await fetch(`/api/destinations/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        const res = await fetch('/api/destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error)
        }
      }
      await fetchDestinations()
      setShowModal(false)
      setEditingId(null)
      setForm({ name: '', type: 'STATE', region: 'North India', accentColor: '#C9972C' })
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all its trips.`)) return
    await fetch(`/api/destinations/${id}`, { method: 'DELETE' })
    await fetchDestinations()
  }

  function openEdit(dest: Destination) {
    setEditingId(dest.id)
    setForm({
      name: dest.name,
      type: dest.type,
      region: dest.region || 'North India',
      accentColor: dest.accentColor,
    })
    setShowModal(true)
  }

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.region || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name))

  const visitedCount = destinations.filter(d => d.trips.length > 0).length

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-fraunces text-3xl text-cream mb-1">Destinations</h1>
          <p className="text-cream-muted text-sm">
            {visitedCount} of {destinations.length} destinations visited
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ name: '', type: 'STATE', region: 'North India', accentColor: '#C9972C' }); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Destination
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search destinations or regions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-input max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-forest-light border border-gold/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-cream-muted">Loading…</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted">Destination</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted hidden md:table-cell">Type</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted hidden lg:table-cell">Region</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted">Trips</th>
                <th className="text-left p-4 text-xs font-data uppercase tracking-wider text-cream-muted">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(dest => (
                <tr key={dest.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: dest.accentColor }} />
                      <span className="text-cream text-sm font-medium">{dest.name}</span>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-cream-muted text-xs">
                      {dest.type === 'STATE' ? 'State' : dest.type === 'UNION_TERRITORY' ? 'UT' : 'Country'}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-cream-dim text-xs">{dest.region || '—'}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-data text-sm text-cream-muted">{dest.trips.length}</span>
                  </td>
                  <td className="p-4">
                    {dest.trips.length > 0 ? (
                      <span className="text-xs bg-sage/15 text-sage-light px-2 py-0.5 rounded-full">Visited</span>
                    ) : (
                      <span className="text-xs bg-cream-dim/10 text-cream-dim px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(dest)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-cream-muted hover:text-cream transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      {dest.isDeletable && (
                        <button
                          onClick={() => handleDelete(dest.id, dest.name)}
                          className="p-1.5 rounded-lg hover:bg-rust/10 text-cream-muted hover:text-rust-light transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy border border-gold/20 rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-fraunces text-xl text-cream mb-5">
              {editingId ? 'Edit Destination' : 'Add Destination'}
            </h2>

            {error && (
              <div className="bg-rust/10 border border-rust/30 text-rust-light rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="admin-label">Name</label>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Andaman & Nicobar"
                  disabled={editingId ? !destinations.find(d => d.id === editingId)?.isCustom : false}
                />
              </div>

              <div>
                <label className="admin-label">Type</label>
                <select
                  className="admin-input"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-label">Region</label>
                <select
                  className="admin-input"
                  value={form.region}
                  onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                >
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-label">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    className="w-10 h-10 rounded border border-gold/20 bg-transparent cursor-pointer"
                  />
                  <input
                    className="admin-input flex-1"
                    value={form.accentColor}
                    onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    placeholder="#C9972C"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setError('') }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="btn-primary flex-1"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import {
  Upload, X, Star, Tag, Plus, ChevronDown, Image as ImageIcon,
  AlertCircle, CheckCircle,
} from 'lucide-react'
import { COMMON_TAGS } from '@/lib/utils'

interface Destination {
  id: string
  name: string
  slug: string
  type: string
  region: string | null
}

interface Photo {
  id: string
  url: string
  caption: string | null
  sortOrder: number
  isCoverPhoto: boolean
}

interface TripFormProps {
  destinations: Destination[]
  initialData?: {
    id: string
    destinationId: string
    placeName: string
    cityRegion: string
    description: string
    bestPart: string
    totalCost: number
    currency: string
    costBreakdown: { travel: number; stay: number; food: number; activities: number; misc: number }
    dateFrom: string
    dateTo: string
    durationDays: number
    rating: number
    tags: string[]
    tips: string
    isPublished: boolean
    isFeatured: boolean
    photos: Photo[]
  }
}

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB']

export function TripForm({ destinations, initialData }: TripFormProps) {
  const router = useRouter()
  const isEditing = !!initialData?.id

  const [form, setForm] = useState({
    destinationId: initialData?.destinationId || '',
    placeName: initialData?.placeName || '',
    cityRegion: initialData?.cityRegion || '',
    description: initialData?.description || '',
    bestPart: initialData?.bestPart || '',
    totalCost: initialData?.totalCost || 0,
    currency: initialData?.currency || 'INR',
    costBreakdown: initialData?.costBreakdown || { travel: 0, stay: 0, food: 0, activities: 0, misc: 0 },
    dateFrom: initialData?.dateFrom ? initialData.dateFrom.slice(0, 10) : '',
    dateTo: initialData?.dateTo ? initialData.dateTo.slice(0, 10) : '',
    durationDays: initialData?.durationDays || 1,
    rating: initialData?.rating || 5,
    tags: initialData?.tags || [],
    tips: initialData?.tips || '',
    isPublished: initialData?.isPublished ?? false,
    isFeatured: initialData?.isFeatured ?? false,
  })

  const [photos, setPhotos] = useState<Photo[]>(initialData?.photos || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Photo upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        // Only save photo to DB if editing existing trip
        if (isEditing && initialData?.id) {
          const photoRes = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tripId: initialData.id,
              url: data.url,
              sortOrder: photos.length,
              isCoverPhoto: photos.length === 0,
            }),
          })
          const photoData = await photoRes.json()
          setPhotos(ps => [...ps, photoData])
        } else {
          // For new trips, hold photos in state; save after trip creation
          setPhotos(ps => [...ps, {
            id: `temp-${Date.now()}`,
            url: data.url,
            caption: '',
            sortOrder: ps.length,
            isCoverPhoto: ps.length === 0,
          }])
        }
      } catch (e: any) {
        setError(`Upload failed: ${e.message}`)
      }
    }
    setUploading(false)
  }, [photos, isEditing, initialData?.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    multiple: true,
  })

  async function removePhoto(photo: Photo) {
    if (photo.id.startsWith('temp-')) {
      setPhotos(ps => ps.filter(p => p.id !== photo.id))
      return
    }
    // Pass tripId in body — required for Firestore subcollection lookup
    await fetch(`/api/photos/${photo.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId: initialData?.id }),
    })
    setPhotos(ps => ps.filter(p => p.id !== photo.id))
  }

  async function setCover(photoId: string) {
    if (photoId.startsWith('temp-')) {
      setPhotos(ps => ps.map(p => ({ ...p, isCoverPhoto: p.id === photoId })))
      return
    }
    await fetch(`/api/photos/${photoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCoverPhoto: true, tripId: initialData?.id }),
    })
    setPhotos(ps => ps.map(p => ({ ...p, isCoverPhoto: p.id === photoId })))
  }

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase()
    if (clean && !form.tags.includes(clean)) {
      setForm(f => ({ ...f, tags: [...f.tags, clean] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  // Auto-calculate total from breakdown
  function updateBreakdown(field: keyof typeof form.costBreakdown, value: number) {
    const newBreakdown = { ...form.costBreakdown, [field]: value }
    const total = Object.values(newBreakdown).reduce((a, b) => a + b, 0)
    setForm(f => ({ ...f, costBreakdown: newBreakdown, totalCost: total }))
  }

  async function handleSubmit(e: React.FormEvent, publish?: boolean) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      isPublished: publish !== undefined ? publish : form.isPublished,
      tags: form.tags,
    }

    try {
      let savedTripId = initialData?.id

      if (isEditing) {
        const res = await fetch(`/api/trips/${initialData!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error)
      } else {
        const res = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        const data = await res.json()
        savedTripId = data.id

        // Save queued photos
        for (const [i, photo] of photos.entries()) {
          await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tripId: savedTripId,
              url: photo.url,
              sortOrder: i,
              isCoverPhoto: i === 0,
            }),
          })
        }
      }

      setSuccess(isEditing ? 'Trip updated!' : 'Trip created!')
      setTimeout(() => router.push('/admin/trips'), 1000)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // Group destinations by region
  const destsByRegion = destinations.reduce((acc, d) => {
    const key = d.region || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {} as Record<string, Destination[]>)

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {error && (
        <div className="flex items-center gap-2 bg-rust/10 border border-rust/30 text-rust-light rounded-lg p-4 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-sage/10 border border-sage/30 text-sage-light rounded-lg p-4 text-sm">
          <CheckCircle size={16} className="shrink-0" />
          {success}
        </div>
      )}

      {/* Basic info */}
      <section className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-5">
        <h2 className="font-fraunces text-lg text-cream">Basic Info</h2>

        <div>
          <label className="admin-label">Destination *</label>
          <select
            className="admin-input"
            value={form.destinationId}
            onChange={e => setForm(f => ({ ...f, destinationId: e.target.value }))}
            required
          >
            <option value="">Select a destination…</option>
            {Object.entries(destsByRegion).sort().map(([region, dests]) => (
              <optgroup key={region} label={region}>
                {dests.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Place Name *</label>
            <input
              className="admin-input"
              value={form.placeName}
              onChange={e => setForm(f => ({ ...f, placeName: e.target.value }))}
              placeholder="e.g. Panaji & North Goa"
              required
            />
          </div>
          <div>
            <label className="admin-label">City / Area within State</label>
            <input
              className="admin-input"
              value={form.cityRegion}
              onChange={e => setForm(f => ({ ...f, cityRegion: e.target.value }))}
              placeholder="e.g. Calangute, Anjuna, Vagator"
            />
          </div>
        </div>

        <div>
          <label className="admin-label">Story / Description *</label>
          <textarea
            className="admin-input resize-y"
            rows={8}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Tell the full story of this trip…"
            required
          />
        </div>

        <div>
          <label className="admin-label">Best Part (highlight quote)</label>
          <input
            className="admin-input"
            value={form.bestPart}
            onChange={e => setForm(f => ({ ...f, bestPart: e.target.value }))}
            placeholder="The one thing that made this trip unforgettable…"
          />
          <p className="text-cream-dim text-xs mt-1">Shown in handwriting style on the public site.</p>
        </div>

        <div>
          <label className="admin-label">Tips for First-Timers</label>
          <textarea
            className="admin-input resize-y"
            rows={4}
            value={form.tips}
            onChange={e => setForm(f => ({ ...f, tips: e.target.value }))}
            placeholder="1. Always rent a scooter&#10;2. Avoid peak season…"
          />
        </div>
      </section>

      {/* Dates & duration */}
      <section className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-5">
        <h2 className="font-fraunces text-lg text-cream">Dates & Duration</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">From</label>
            <input
              type="date"
              className="admin-input"
              value={form.dateFrom}
              onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))}
            />
          </div>
          <div>
            <label className="admin-label">To (optional)</label>
            <input
              type="date"
              className="admin-input"
              value={form.dateTo}
              onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))}
            />
          </div>
          <div>
            <label className="admin-label">Duration (days)</label>
            <input
              type="number"
              className="admin-input"
              value={form.durationDays}
              onChange={e => setForm(f => ({ ...f, durationDays: parseInt(e.target.value) || 1 }))}
              min={1}
            />
          </div>
        </div>
      </section>

      {/* Rating & tags */}
      <section className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-5">
        <h2 className="font-fraunces text-lg text-cream">Rating & Tags</h2>

        <div>
          <label className="admin-label">Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setForm(f => ({ ...f, rating: n }))}
                className={`text-2xl transition-transform hover:scale-110 ${
                  n <= form.rating ? 'text-gold' : 'text-cream-dim'
                }`}
              >
                ★
              </button>
            ))}
            <span className="text-cream-muted text-sm ml-2 font-data">{form.rating}/5</span>
          </div>
        </div>

        <div>
          <label className="admin-label">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1.5 bg-gold/15 text-gold text-xs px-2.5 py-1 rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              className="admin-input flex-1 max-w-xs"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
              placeholder="Type a tag and press Enter…"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_TAGS.filter(t => !form.tags.includes(t)).map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="text-xs text-cream-dim border border-cream-dim/20 hover:border-gold/40 hover:text-gold px-2 py-0.5 rounded-full transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cost */}
      <section className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-5">
        <h2 className="font-fraunces text-lg text-cream">Cost Breakdown</h2>
        <div className="flex items-center gap-3 mb-2">
          <select
            className="admin-input w-28"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
          >
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex-1">
            <label className="admin-label">Total</label>
            <input
              type="number"
              className="admin-input font-data"
              value={form.totalCost}
              onChange={e => setForm(f => ({ ...f, totalCost: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
            />
            <p className="text-cream-dim text-xs mt-1">Auto-calculated from breakdown below, or enter manually.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(form.costBreakdown) as Array<keyof typeof form.costBreakdown>).map(field => (
            <div key={field}>
              <label className="admin-label capitalize">{field}</label>
              <input
                type="number"
                className="admin-input font-data text-sm"
                value={form.costBreakdown[field]}
                onChange={e => updateBreakdown(field, parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      <section className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-4">
        <h2 className="font-fraunces text-lg text-cream">Photos</h2>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg border border-gold/20"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCover(photo.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      photo.isCoverPhoto
                        ? 'bg-gold text-forest'
                        : 'bg-white/20 text-white hover:bg-gold hover:text-forest'
                    } transition-colors`}
                    title="Set as cover"
                  >
                    {photo.isCoverPhoto ? '✓ Cover' : 'Cover'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    className="p-1 bg-rust/80 text-white rounded hover:bg-rust transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                {photo.isCoverPhoto && (
                  <div className="absolute top-1.5 left-1.5 bg-gold text-forest text-xs px-1.5 py-0.5 rounded font-semibold">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-gold bg-gold/5'
              : 'border-cream-dim/20 hover:border-gold/40 hover:bg-white/3'
          }`}
        >
          <input {...getInputProps()} />
          <Upload size={24} className="mx-auto text-cream-dim mb-2" />
          {uploading ? (
            <p className="text-cream-muted text-sm">Uploading…</p>
          ) : isDragActive ? (
            <p className="text-gold text-sm">Drop photos here!</p>
          ) : (
            <>
              <p className="text-cream-muted text-sm">Drag & drop photos here, or click to browse</p>
              <p className="text-cream-dim text-xs mt-1">JPEG, PNG, WebP up to 10MB each</p>
            </>
          )}
        </div>
      </section>

      {/* Publish settings */}
      <section className="bg-forest-light border border-gold/10 rounded-xl p-6 space-y-4">
        <h2 className="font-fraunces text-lg text-cream">Publish Settings</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${
                form.isPublished ? 'bg-sage' : 'bg-cream-dim/20'
              }`}
              onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                form.isPublished ? 'left-5' : 'left-1'
              }`} />
            </div>
            <span className="text-sm text-cream">
              {form.isPublished ? 'Published (live on site)' : 'Draft (not visible publicly)'}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${
                form.isFeatured ? 'bg-gold' : 'bg-cream-dim/20'
              }`}
              onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                form.isFeatured ? 'left-5' : 'left-1'
              }`} />
            </div>
            <span className="text-sm text-cream">
              {form.isFeatured ? 'Featured on homepage' : 'Not featured'}
            </span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex-1 sm:flex-none sm:min-w-36 py-3"
        >
          {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Save Draft'}
        </button>
        {!form.isPublished && (
          <button
            type="button"
            disabled={saving}
            onClick={e => handleSubmit(e as any, true)}
            className="btn-secondary flex-1 sm:flex-none sm:min-w-36 py-3"
          >
            Save & Publish
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/admin/trips')}
          className="btn-secondary py-3 px-5"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

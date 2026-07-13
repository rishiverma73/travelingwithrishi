import { getTrips } from '@/lib/firebase/firestore'
import Link from 'next/link'
import { BookOpen, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminMediaPage() {
  // Fetch all trips (all, not just published) with photos
  const trips = await getTrips({ includePhotos: true })

  // Flatten all photos with trip context
  const photos = trips.flatMap(trip =>
    (trip.photos ?? []).map(photo => ({
      ...photo,
      trip: {
        id: trip.id,
        placeName: trip.placeName,
        destination: trip.destination,
      },
    }))
  )

  // Sort by descending order (photos don't have createdAt; approximate by tripId + sortOrder)
  photos.sort((a, b) => b.sortOrder - a.sortOrder)

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl text-cream mb-1">Media Library</h1>
        <p className="text-cream-muted text-sm">{photos.length} photos across all trips</p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-24 bg-forest-light border border-gold/10 rounded-xl">
          <BookOpen size={40} className="mx-auto text-cream-dim mb-3" />
          <p className="text-cream-muted mb-2">No photos yet</p>
          <p className="text-cream-dim text-sm">Upload photos when adding or editing trips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map(photo => (
            <div key={photo.id} className="group relative aspect-square">
              <img
                src={photo.url}
                alt={photo.caption || ''}
                className="w-full h-full object-cover rounded-xl border border-gold/10"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                <p className="text-white text-xs font-medium text-center leading-tight truncate w-full text-center">
                  {photo.trip.placeName}
                </p>
                <p className="text-white/60 text-xs">{photo.trip.destination.name}</p>
                <div className="flex gap-2 mt-1">
                  <Link
                    href={`/admin/trips/${photo.trip.id}/edit`}
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40 transition-colors"
                    title="Edit trip"
                  >
                    <ExternalLink size={13} className="text-white" />
                  </Link>
                </div>
              </div>
              {photo.isCoverPhoto && (
                <div className="absolute top-2 left-2 bg-gold text-forest text-xs px-1.5 py-0.5 rounded font-semibold">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

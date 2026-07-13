import { getTripById, getDestinations } from '@/lib/firebase/firestore'
import { TripForm } from '@/components/admin/TripForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditTripPage({ params }: { params: { id: string } }) {
  const [trip, destinations] = await Promise.all([
    getTripById(params.id, true /* includePhotos */),
    getDestinations(),
  ])

  if (!trip) notFound()

  const initialData = {
    id: trip.id,
    destinationId: trip.destinationSlug,  // TripForm uses destinationId field name
    placeName: trip.placeName,
    cityRegion: trip.cityRegion || '',
    description: trip.description,
    bestPart: trip.bestPart || '',
    totalCost: trip.totalCost,
    currency: trip.currency,
    costBreakdown: trip.costBreakdown,  // already a native object
    dateFrom: trip.dateFrom || '',
    dateTo: trip.dateTo || '',
    durationDays: trip.durationDays || 1,
    rating: trip.rating,
    tags: trip.tags,  // already a native array
    tips: trip.tips || '',
    isPublished: trip.isPublished,
    isFeatured: trip.isFeatured,
    photos: trip.photos ?? [],
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link href="/admin/trips" className="flex items-center gap-2 text-cream-muted hover:text-cream text-sm mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Trips
        </Link>
        <h1 className="font-fraunces text-3xl text-cream">Edit Trip</h1>
        <p className="text-cream-muted text-sm mt-1">{trip.placeName}</p>
      </div>
      <TripForm destinations={destinations as any} initialData={initialData as any} />
    </div>
  )
}

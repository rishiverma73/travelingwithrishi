import { getDestinations } from '@/lib/firebase/firestore'
import { TripForm } from '@/components/admin/TripForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewTripPage() {
  const destinations = await getDestinations()

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <Link href="/admin/trips" className="flex items-center gap-2 text-cream-muted hover:text-cream text-sm mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Trips
        </Link>
        <h1 className="font-fraunces text-3xl text-cream">Add New Trip</h1>
        <p className="text-cream-muted text-sm mt-1">Log a new journey to your travel diary.</p>
      </div>
      <TripForm destinations={destinations} />
    </div>
  )
}

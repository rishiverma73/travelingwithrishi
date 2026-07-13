import { NextRequest, NextResponse } from 'next/server'
import { getDestinations, createDestination } from '@/lib/firebase/firestore'

// GET /api/destinations — list all destinations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const withTrips = searchParams.get('withTrips') === 'true'
    const search = searchParams.get('search') || ''

    const destinations = await getDestinations({
      withTripCounts: true,
      withPublishedTrips: withTrips,
    })

    // Client-side search filter
    const filtered = search
      ? destinations.filter(d =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          (d.region ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : destinations

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Destinations GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch destinations' }, { status: 500 })
  }
}

// POST /api/destinations — create new destination
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, region, accentColor } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    const destination = await createDestination({ name, type, region, accentColor })
    return NextResponse.json(destination, { status: 201 })
  } catch (error: any) {
    console.error('Destinations POST error:', error)
    if (error.message === 'A destination with this name already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create destination' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getTrips, createTrip } from '@/lib/firebase/firestore'

// GET /api/trips
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const destinationSlug = searchParams.get('destinationId') || searchParams.get('destinationSlug') || undefined
    const publishedOnly = searchParams.get('published') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '0') || undefined
    const search = searchParams.get('search') || undefined

    const trips = await getTrips({
      destinationSlug,
      publishedOnly,
      featured,
      limit,
      search,
      includePhotos: true,
    })

    return NextResponse.json(trips)
  } catch (error) {
    console.error('Trips GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

// POST /api/trips
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      destinationId,    // legacy field name — maps to destinationSlug
      destinationSlug,
      placeName,
      cityRegion,
      description,
      bestPart,
      totalCost,
      currency,
      costBreakdown,
      dateFrom,
      dateTo,
      durationDays,
      rating,
      tags,
      tips,
      isPublished,
      isFeatured,
    } = body

    const slug = destinationSlug || destinationId
    if (!slug || !placeName || !description) {
      return NextResponse.json(
        { error: 'destinationId, placeName, and description are required' },
        { status: 400 }
      )
    }

    const trip = await createTrip({
      destinationSlug: slug,
      placeName,
      cityRegion: cityRegion || undefined,
      description,
      bestPart: bestPart || undefined,
      totalCost: totalCost || 0,
      currency: currency || 'INR',
      costBreakdown,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      durationDays: durationDays || undefined,
      rating: rating || 5,
      tags: Array.isArray(tags) ? tags : [],
      tips: tips || undefined,
      isPublished: isPublished ?? false,
      isFeatured: isFeatured ?? false,
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error: any) {
    console.error('Trips POST error:', error)
    if (error.message === 'Destination not found') {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createPhoto, getPhotos } from '@/lib/firebase/firestore'

// POST /api/photos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tripId, url, caption, sortOrder, isCoverPhoto } = body

    if (!tripId || !url) {
      return NextResponse.json({ error: 'tripId and url are required' }, { status: 400 })
    }

    const photo = await createPhoto(tripId, {
      url,
      caption: caption || undefined,
      sortOrder: sortOrder ?? 0,
      isCoverPhoto: isCoverPhoto ?? false,
    })

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('Photos POST error:', error)
    return NextResponse.json({ error: 'Failed to create photo' }, { status: 500 })
  }
}

// GET /api/photos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tripId = searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required' }, { status: 400 })
    }

    const photos = await getPhotos(tripId)
    return NextResponse.json(photos)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

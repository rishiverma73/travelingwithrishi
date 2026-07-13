import { NextRequest, NextResponse } from 'next/server'
import { getTripById, updateTrip, deleteTrip } from '@/lib/firebase/firestore'
import { deleteFile } from '@/lib/upload'

// GET /api/trips/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const trip = await getTripById(params.id, true)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    return NextResponse.json(trip)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 })
  }
}

// PATCH /api/trips/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    const existing = await getTripById(params.id, false)
    if (!existing) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const {
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
      destinationId,
      destinationSlug,
    } = body

    const updated = await updateTrip(params.id, {
      ...(placeName !== undefined ? { placeName } : {}),
      ...(cityRegion !== undefined ? { cityRegion } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(bestPart !== undefined ? { bestPart } : {}),
      ...(totalCost !== undefined ? { totalCost } : {}),
      ...(currency !== undefined ? { currency } : {}),
      ...(costBreakdown !== undefined ? { costBreakdown } : {}),
      ...(dateFrom !== undefined ? { dateFrom } : {}),
      ...(dateTo !== undefined ? { dateTo } : {}),
      ...(durationDays !== undefined ? { durationDays } : {}),
      ...(rating !== undefined ? { rating } : {}),
      ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags : [] } : {}),
      ...(tips !== undefined ? { tips } : {}),
      ...(isPublished !== undefined ? { isPublished } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      // Accept either field name
      ...((destinationSlug || destinationId) !== undefined
        ? { destinationSlug: destinationSlug || destinationId }
        : {}),
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Trip PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

// DELETE /api/trips/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const trip = await getTripById(params.id, true)
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Delete all photo files from Storage
    if (trip.photos) {
      for (const photo of trip.photos) {
        await deleteFile(photo.url)
      }
    }

    await deleteTrip(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}

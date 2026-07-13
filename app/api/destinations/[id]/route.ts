import { NextRequest, NextResponse } from 'next/server'
import {
  getDestinationBySlug,
  updateDestination,
  deleteDestination,
  getDestinationWithTrips,
} from '@/lib/firebase/firestore'

// GET /api/destinations/[id]  — id = slug in Firestore
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dest = await getDestinationWithTrips(params.id)
    if (!dest) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }
    return NextResponse.json(dest)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch destination' }, { status: 500 })
  }
}

// PATCH /api/destinations/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, region, accentColor, type } = body

    const dest = await getDestinationBySlug(params.id)
    if (!dest) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    const updated = await updateDestination(params.id, {
      ...(name && dest.isCustom ? { name } : {}),
      ...(region !== undefined ? { region } : {}),
      ...(accentColor ? { accentColor } : {}),
      ...(type && dest.isCustom ? { type } : {}),
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update destination' }, { status: 500 })
  }
}

// DELETE /api/destinations/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dest = await getDestinationBySlug(params.id)
    if (!dest) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    if (!dest.isDeletable) {
      return NextResponse.json(
        { error: 'Default Indian states/UTs cannot be deleted' },
        { status: 403 }
      )
    }

    await deleteDestination(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete destination' }, { status: 500 })
  }
}

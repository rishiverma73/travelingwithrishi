import { NextRequest, NextResponse } from 'next/server'
import { getPhotoById, updatePhoto, deletePhoto } from '@/lib/firebase/firestore'
import { deleteFile } from '@/lib/upload'

// PATCH /api/photos/[id]
// Body must include tripId since photos are stored in a subcollection under trips
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { tripId, caption, sortOrder, isCoverPhoto } = body

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required in request body' }, { status: 400 })
    }

    const photo = await getPhotoById(tripId, params.id)
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const updated = await updatePhoto(tripId, params.id, {
      ...(caption !== undefined ? { caption } : {}),
      ...(sortOrder !== undefined ? { sortOrder } : {}),
      ...(isCoverPhoto !== undefined ? { isCoverPhoto } : {}),
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Photo PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}

// DELETE /api/photos/[id]
// Body must include tripId
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // tripId can come from body or query param
    let tripId: string | null = null
    try {
      const body = await req.json()
      tripId = body.tripId
    } catch {
      tripId = new URL(req.url).searchParams.get('tripId')
    }

    if (!tripId) {
      return NextResponse.json({ error: 'tripId is required' }, { status: 400 })
    }

    const photo = await getPhotoById(tripId, params.id)
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete file from Firebase Storage
    await deleteFile(photo.url)

    // Delete from Firestore subcollection
    await deletePhoto(tripId, params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Photo DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}

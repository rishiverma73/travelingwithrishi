import path from 'path'

/**
 * Upload abstraction layer — now backed by Firebase Storage.
 * The public interface (uploadFile, deleteFile, validateUpload) is unchanged
 * so all call-sites work without modification.
 */

export interface UploadResult {
  url: string
  filename: string
}

/**
 * Upload a file buffer to Firebase Storage and return its public download URL.
 */
export async function uploadFile(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<UploadResult> {
  // Dynamic import to keep admin SDK out of client bundles
  const { adminStorage } = await import('./firebase/admin')

  const ext = path.extname(originalFilename).toLowerCase()
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const storagePath = `photos/${uniqueName}`

  const bucket = adminStorage.bucket()
  const file = bucket.file(storagePath)

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
    },
    resumable: false,
  })

  // Make the file publicly readable
  await file.makePublic()

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

  return {
    url: publicUrl,
    filename: uniqueName,
  }
}

/**
 * Delete a file from Firebase Storage using its public URL.
 */
export async function deleteFile(url: string): Promise<void> {
  if (!url || !url.includes('storage.googleapis.com')) return

  try {
    const { adminStorage } = await import('./firebase/admin')
    const bucket = adminStorage.bucket()

    // Extract the path after the bucket name from the URL
    // URL format: https://storage.googleapis.com/{bucket}/{path}
    const bucketName = bucket.name
    const urlPath = url.replace(`https://storage.googleapis.com/${bucketName}/`, '')

    if (urlPath && urlPath !== url) {
      await bucket.file(decodeURIComponent(urlPath)).delete({ ignoreNotFound: true })
    }
  } catch {
    // File might not exist or URL might not be a Storage URL; ignore
  }
}

/**
 * Validate an uploaded file (unchanged).
 */
export function validateUpload(file: {
  size: number
  type: string
}): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
  }

  return { valid: true }
}

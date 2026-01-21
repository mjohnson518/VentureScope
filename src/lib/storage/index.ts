import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'documents'

export async function uploadFile(
  file: File,
  orgId: string,
  companyId: string
): Promise<{ path: string; url: string }> {
  const supabase = await createClient()

  // Generate unique file path: orgId/companyId/timestamp-filename
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `${orgId}/${companyId}/${timestamp}-${sanitizedName}`

  // Convert File to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL (or signed URL if bucket is private)
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`)
  }

  return data.signedUrl
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

export async function downloadFile(path: string): Promise<Blob> {
  const supabase = await createClient()

  const { data, error } = await supabase.storage.from(BUCKET_NAME).download(path)

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`)
  }

  return data
}

// Admin function to get file without RLS
export async function adminDownloadFile(path: string): Promise<Blob> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.storage.from(BUCKET_NAME).download(path)

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`)
  }

  return data
}

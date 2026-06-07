import { supabase } from './supabase'

const BUCKET = 'po-approvals'

/**
 * Upload a signature from an HTML5 Canvas element to Supabase Storage.
 * Returns the public URL or null if upload fails / Supabase not configured.
 */
export async function uploadSignature(canvasElement, poId) {
  try {
    const blob = await new Promise((resolve, reject) => {
      canvasElement.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        'image/png'
      )
    })
    const filename = `signatures/sig_${poId}_${Date.now()}.png`
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, blob, { contentType: 'image/png', upsert: true })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename)

    return urlData.publicUrl
  } catch (err) {
    console.warn('[SupabaseStorage] Signature upload failed:', err.message)
    return null
  }
}

/**
 * Upload a user-selected attachment file to Supabase Storage.
 * Validates extension against an allowlist.
 * Returns the public URL or null if upload fails / Supabase not configured.
 */
export async function uploadAttachment(file, poId) {
  try {
    const ext = file.name.split('.').pop().toLowerCase()
    const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']
    if (!allowed.includes(ext)) {
      throw new Error(`File type .${ext} is not allowed`)
    }

    const filename = `attachments/att_${poId}_${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { contentType: file.type, upsert: true })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename)

    return urlData.publicUrl
  } catch (err) {
    console.warn('[SupabaseStorage] Attachment upload failed:', err.message)
    return null
  }
}

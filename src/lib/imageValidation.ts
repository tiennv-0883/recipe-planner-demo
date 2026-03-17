/**
 * Client-side image validation for recipe photo uploads.
 *
 * Validates file size ≤ 5 MB and MIME type (JPEG or PNG only).
 * Additional server-side enforcement is provided by the Supabase Storage bucket
 * configuration (file_size_limit + allowed_mime_types).
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB in bytes

export const ALLOWED_MIME_TYPES: readonly string[] = ['image/jpeg', 'image/png']

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; error: string }

/**
 * Validates a File before uploading to Supabase Storage.
 *
 * Checks (in order):
 *  1. File is not empty (size > 0)
 *  2. File size ≤ MAX_FILE_SIZE (5 MB)
 *  3. MIME type is in ALLOWED_MIME_TYPES (JPEG or PNG)
 *
 * @param file - The File object to validate.
 * @returns `{ valid: true }` or `{ valid: false, error: string }`.
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty. Please choose a valid image.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image exceeds the 5 MB size limit. Please choose a smaller file.' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG and PNG images are accepted.' }
  }

  return { valid: true }
}

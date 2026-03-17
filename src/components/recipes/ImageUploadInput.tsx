'use client'

import { useEffect, useRef, useState } from 'react'

interface ImageUploadInputProps {
  /** URL of the existing image shown on load (edit mode). */
  currentUrl?: string
  /** Called whenever the user selects a valid file or clears the selection. */
  onFileSelect: (file: File | null) => void
  /** Validation error message from the parent component. */
  error?: string
}

/**
 * Click-to-upload area for recipe photos.
 *
 * - Shows a placeholder when no image is selected.
 * - Shows an instant preview via URL.createObjectURL() on file select.
 * - In edit mode, shows the current URL as the initial preview.
 * - An × button clears the selection and reverts to the initial currentUrl.
 * - Blob URLs are revoked on cleanup to prevent memory leaks.
 * - Accepts only image/jpeg and image/png.
 */
export default function ImageUploadInput({
  currentUrl,
  onFileSelect,
  error,
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Preview URL — starts as currentUrl (edit) or null (new)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)
  // Track the blob URL we created so we can revoke it on cleanup
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  // Revoke blob URL when component unmounts or objectUrl changes
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  function openFilePicker() {
    inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null

    // Revoke previous blob URL before creating a new one
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      setObjectUrl(null)
    }

    if (!file) {
      onFileSelect(null)
      return
    }

    const url = URL.createObjectURL(file)
    setObjectUrl(url)
    setPreviewUrl(url)
    onFileSelect(file)

    // Reset <input> value so selecting the same file again triggers onChange
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      setObjectUrl(null)
    }
    // Revert preview to the original currentUrl (or placeholder if none)
    setPreviewUrl(currentUrl ?? null)
    onFileSelect(null)
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-1">
        Photo{' '}
        <span className="text-gray-400 font-normal text-xs">(optional · JPEG or PNG, max 5 MB)</span>
      </span>

      {/* Upload area */}
      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openFilePicker()}
        aria-label="Upload recipe photo"
        className="relative w-full rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-brand-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        style={{ minHeight: '140px' }}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Recipe preview"
              className="w-full object-cover"
              style={{ maxHeight: '220px' }}
            />

            {/* Clear button */}
            <button
              type="button"
              onClick={handleClear}
              aria-label="Remove photo"
              className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1.5 text-white hover:bg-gray-900/80 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </>
        ) : (
          /* Placeholder */
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400 select-none">
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 12V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v12a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18v-6z"
              />
            </svg>
            <span className="text-sm font-medium">Click to upload a photo</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="sr-only"
        aria-label="Photo file input"
        tabIndex={-1}
      />

      {/* Validation error */}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

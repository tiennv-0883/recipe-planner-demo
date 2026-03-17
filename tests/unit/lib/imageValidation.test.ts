import { validateImageFile, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from '@/src/lib/imageValidation'

/**
 * Helper: creates a File with a given byte size and MIME type.
 */
function makeFile(size: number, type: string, name = 'test.jpg'): File {
  const bytes = new Uint8Array(size)
  return new File([bytes], name, { type })
}

describe('validateImageFile', () => {
  describe('valid files', () => {
    it('accepts a valid JPEG under 5 MB', () => {
      const file = makeFile(1024 * 1024, 'image/jpeg', 'photo.jpg')
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it('accepts a valid PNG under 5 MB', () => {
      const file = makeFile(512 * 1024, 'image/png', 'photo.png')
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })

    it('accepts a file exactly at the 5 MB limit', () => {
      const file = makeFile(MAX_FILE_SIZE, 'image/jpeg', 'exact.jpg')
      const result = validateImageFile(file)
      expect(result.valid).toBe(true)
    })
  })

  describe('invalid files — size', () => {
    it('rejects a file larger than 5 MB', () => {
      const file = makeFile(MAX_FILE_SIZE + 1, 'image/jpeg', 'huge.jpg')
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) expect(result.error).toMatch(/5 MB/i)
    })

    it('rejects an empty file (0 bytes)', () => {
      const file = makeFile(0, 'image/jpeg', 'empty.jpg')
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) expect(result.error).toBeTruthy()
    })
  })

  describe('invalid files — MIME type', () => {
    it('rejects a GIF', () => {
      const file = makeFile(1024, 'image/gif', 'anim.gif')
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) expect(result.error).toMatch(/jpeg|png/i)
    })

    it('rejects a PDF', () => {
      const file = makeFile(1024, 'application/pdf', 'doc.pdf')
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) expect(result.error).toMatch(/jpeg|png/i)
    })

    it('rejects a WebP', () => {
      const file = makeFile(1024, 'image/webp', 'photo.webp')
      const result = validateImageFile(file)
      expect(result.valid).toBe(false)
      if (!result.valid) expect(result.error).toMatch(/jpeg|png/i)
    })
  })

  describe('exported constants', () => {
    it('exports MAX_FILE_SIZE as 5 * 1024 * 1024', () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024)
    })

    it('exports ALLOWED_MIME_TYPES containing image/jpeg', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg')
    })

    it('exports ALLOWED_MIME_TYPES containing image/png', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/png')
    })

    it('exports ALLOWED_MIME_TYPES not containing image/gif', () => {
      expect(ALLOWED_MIME_TYPES).not.toContain('image/gif')
    })
  })
})

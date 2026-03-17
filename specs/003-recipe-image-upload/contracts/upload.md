# Contract: Recipe Image Upload

**Phase**: 1 — Design  
**Branch**: `003-recipe-image-upload`  
**Date**: 2026-03-17  
**Type**: Client-Side Storage Contract (no custom API route — direct Supabase Storage upload)

---

## Overview

Images are uploaded **directly from the browser** to Supabase Storage using the browser Supabase client. No file binary data passes through the Next.js / Vercel API server. The resulting public URL is then stored in the `photo_url` field via the existing recipe create/update API routes.

---

## Upload Flow

```
1. User selects file in <ImageUploadInput>
   ↓
2. validateImageFile(file) → instant client-side check (size + MIME type)
   ↓ if invalid → show error, abort
   ↓ if valid →
3. Show preview via URL.createObjectURL(file)
   ↓
4. User fills rest of form → clicks "Save Recipe"
   ↓
5. RecipeForm.onSubmit():
   a. Upload file to Supabase Storage:
      supabase.storage
        .from('recipe-images')
        .upload(`${user.id}/${recipeId}.${ext}`, file, { upsert: true })
   b. Get public URL:
      supabase.storage
        .from('recipe-images')
        .getPublicUrl(`${user.id}/${recipeId}.${ext}`)
   c. Include publicUrl in recipe payload → POST /api/recipes OR PUT /api/recipes/{id}
```

---

## Supabase Storage Operations

### Upload (Create / Replace)

```typescript
const ext = file.name.split('.').pop() ?? 'jpg'
const path = `${userId}/${recipeId}.${ext}`

const { data, error } = await supabase.storage
  .from('recipe-images')
  .upload(path, file, {
    contentType: file.type,   // 'image/jpeg' | 'image/png'
    upsert: true,             // overwrites old image on edit
    cacheControl: '3600',
  })
```

**Success**: `data.path` returns the stored path.  
**Error**: `error.message` describes the failure (size/type rejected by bucket policy, auth error).

### Get Public URL

```typescript
const { data: { publicUrl } } = supabase.storage
  .from('recipe-images')
  .getPublicUrl(path)
// publicUrl = "https://{project}.supabase.co/storage/v1/object/public/recipe-images/{path}"
```

This URL is stored as `photoUrl` / `photo_url` on the recipe.

### Delete (on recipe delete)

Called server-side from `DELETE /api/recipes/[id]` after soft-delete:

```typescript
// Only attempt if photo_url contains the Storage bucket URL (not Unsplash)
const isStorageUrl = recipe.photo_url?.includes('/recipe-images/')
if (isStorageUrl) {
  const path = new URL(recipe.photo_url!).pathname
    .split('/recipe-images/')[1]   // "{user_id}/{recipe_id}.ext"
  await supabaseAdmin.storage.from('recipe-images').remove([path])
}
```

---

## Existing Recipe API Changes

### `POST /api/recipes` — Create Recipe

**No contract change** — `photo_url` was already an optional field in the request body. Now it will be set to the Storage public URL (or empty string if no image).

**Request body** (unchanged):
```json
{
  "title": "Spaghetti",
  "cookTimeMinutes": 30,
  "servings": 4,
  "tags": ["dinner"],
  "ingredients": [...],
  "steps": [...],
  "photoUrl": "https://{project}.supabase.co/storage/v1/object/public/recipe-images/{userId}/{recipeId}.jpg"
}
```

### `PUT /api/recipes/[id]` — Update Recipe

**No contract change** — same as above. `photoUrl` replaces the old value in `photo_url`.

---

## Error Responses (client-side validation)

| Condition | Error Message |
|-----------|--------------|
| File type is not JPEG or PNG | `"Only JPEG and PNG images are supported."` |
| File size exceeds 5 MB | `"Image must be smaller than 5 MB."` |
| Storage upload fails | `"Failed to upload image. Please try again."` |
| No file selected | No error — recipe saves without an image (photoUrl = undefined) |

---

## `ImageUploadInput` Component Contract

```typescript
interface ImageUploadInputProps {
  /** Current image URL (for edit mode — shows existing image as initial preview) */
  currentUrl?: string
  /** Called with the selected File when user picks a valid file */
  onFileSelect: (file: File | null) => void
  /** Validation error to display (passed from parent after validateImageFile) */
  error?: string
}
```

**Behaviour**:
- Renders a styled click-to-upload area
- Shows `<img>` preview via `URL.createObjectURL()` after valid file selection
- Clears preview and calls `onFileSelect(null)` if user removes the image
- Calls `URL.revokeObjectURL()` on unmount to avoid memory leaks
- Accepts only `image/jpeg, image/png` via `accept` attribute on `<input type="file">`

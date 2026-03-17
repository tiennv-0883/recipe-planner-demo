# Data Model: Recipe Image Upload

**Phase**: 1 — Design  
**Branch**: `003-recipe-image-upload`  
**Date**: 2026-03-17

---

## Schema Changes

**No new DB columns or tables.** The `photo_url TEXT` column already exists on the `recipes` table (spec 002). This feature adds:
1. A Supabase Storage bucket (`recipe-images`)
2. RLS policies on `storage.objects`

---

## SQL Migration: `supabase/migrations/002_storage_recipe_images.sql`

```sql
-- ─────────────────────────────────────────────
-- Create the recipe-images Storage bucket
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true,          -- public: getPublicUrl() returns URLs readable without auth headers
  5242880,       -- 5 MB max per file
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- RLS policies on storage.objects
-- (RLS is already enabled on storage.objects by Supabase default)
-- ─────────────────────────────────────────────

-- Public SELECT: any browser can load recipe images via <img src={publicUrl}>
CREATE POLICY "Public read recipe images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'recipe-images' );

-- Authenticated INSERT: user can only upload to their own folder
CREATE POLICY "Users insert own recipe images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated UPDATE: user can only overwrite their own files
CREATE POLICY "Users update own recipe images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated DELETE: user can only delete their own files
CREATE POLICY "Users delete own recipe images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Storage Object Model

```
Bucket: recipe-images  (public = true)
├── {user_id}/
│   ├── {recipe_id}.jpg       ← uploaded by user
│   ├── {recipe_id}.png       ← uploaded by user
│   └── ...
└── ...

Path convention: {user_id}/{recipe_id}.{ext}
Example:         a1b2c3d4-e5f6-7890-abcd/d4e5f6a7-b8c9-0123-ef45.jpg
```

**Key properties**:
- `{user_id}` is `auth.uid()` from Supabase Auth — matches `recipes.user_id`
- `{recipe_id}` is the recipe UUID — deterministic, enables upsert on edit (same path overwrites old image)
- File extension preserved from original upload filename
- Each recipe has at most one image in Storage (deterministic path)

---

## Domain Model Changes

### `Recipe` type (`src/types/index.ts`)

```typescript
export interface Recipe {
  id: string
  title: string
  photoUrl?: string    // already exists — no change
  // ...
}
```

`photoUrl` is `undefined` or `''` when no image. When set, it is either:
- A Supabase Storage public URL: `https://{project}.supabase.co/storage/v1/object/public/recipe-images/{user_id}/{recipe_id}.{ext}`
- A public Unsplash URL: `https://images.unsplash.com/photo-{id}?w=800&q=80`

### `RecipeFormValues` (`src/components/recipes/RecipeForm.tsx`)

```typescript
interface RecipeFormValues {
  title: string
  cookTimeMinutes: number
  servings: number
  tags: Tag[]
  ingredients: Omit<IngredientLine, 'id'>[]
  steps: Omit<PreparationStep, 'order'>[]
  photoUrl?: string    // already exists — no change
}
```

The `photoUrl` value in `RecipeFormValues` is set **after** the image is uploaded to Storage as part of form submit.

---

## `validateImageFile()` Utility

```typescript
// src/lib/imageValidation.ts
export const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']

export type ImageValidationResult =
  | { valid: true }
  | { valid: false; error: string }

export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG and PNG images are supported.' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image must be smaller than 5 MB.' }
  }
  return { valid: true }
}
```

---

## Entity Relationships (unchanged)

```
User (Supabase Auth)
 └── owns many → Recipe
       └── has 0..1 → Storage Object (recipe-images/{user_id}/{recipe_id}.ext)
```

The `photo_url` field on `recipes` holds the public URL of the Storage object, or a public external URL (Unsplash), or NULL/empty string.

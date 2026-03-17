-- 002_storage_recipe_images.sql
-- Creates the recipe-images Storage bucket with public read and per-user write RLS.
-- Run once in the Supabase SQL Editor after applying migration 001.

-- ─── Bucket ──────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recipe-images',
  'recipe-images',
  true,
  5242880,                              -- 5 MB
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ─── RLS Policies ────────────────────────────────────────────────────────────
--  Policy 1: Anyone (anonymous + authenticated) can view recipe images.

CREATE POLICY "Public read recipe images"
  ON storage.objects
  FOR SELECT
  USING ( bucket_id = 'recipe-images' );

-- Policy 2: Authenticated users can upload to their own folder only.
--  Path format: {user_id}/{filename}
--  The first path segment must equal the authenticated user's UUID.

CREATE POLICY "Users insert own recipe images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Users can update (overwrite) only their own files.

CREATE POLICY "Users update own recipe images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Users can delete only their own files.

CREATE POLICY "Users delete own recipe images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recipe-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

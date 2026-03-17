# Quickstart: Recipe Image Upload

**Branch**: `003-recipe-image-upload`  
**Prerequisites**: spec 002 (Supabase migration) complete, `.env.local` configured, dev server running

---

## Local Setup

```bash
# From repo root on branch 003-recipe-image-upload
git checkout 003-recipe-image-upload
npm install   # no new packages required
```

---

## Step 1 — Run the Storage Migration

Open your Supabase project → **SQL Editor** → **New query**.

Paste and run `supabase/migrations/002_storage_recipe_images.sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recipe-images', 'recipe-images', true, 5242880, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;
-- (+ 4 RLS policy statements — see full file)
```

**Verify in Supabase Dashboard**:  
- Storage → Buckets → `recipe-images` appears  
- Bucket is marked **Public**

---

## Step 2 — Verify `next.config.ts` Remote Patterns

Confirm `next.config.ts` includes:

```ts
images: {
  unoptimized: true,
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: '*.supabase.co' },
  ],
}
```

---

## Step 3 — Run the App

```bash
npm run dev
```

---

## Step 4 — Smoke Test Image Upload

1. Login → **My Recipes** → **New Recipe**
2. Fill in title, add an ingredient, add a step
3. Click the image upload area → select a JPEG or PNG under 5 MB
4. Verify preview appears immediately
5. Click **Save Recipe**
6. Verify recipe detail page shows the uploaded image
7. Reload the page → image still shows

---

## Step 5 — Smoke Test Validation

1. Try uploading a file > 5 MB → error message: *"Image must be smaller than 5 MB."*
2. Try uploading a PDF or GIF → error message: *"Only JPEG and PNG images are supported."*

---

## Step 6 — Smoke Test Seed Images

1. Register a new account (or use an existing one with seed data already loaded)
2. Open **My Recipes** → verify all 20 seed recipes show real food photographs
3. Open the detail page for any seed recipe → image loads correctly

---

## Step 7 — Smoke Test Edit / Replace

1. Open any recipe with an image → click **Edit**
2. Verify the current image is shown as the preview
3. Select a different image file
4. Verify the preview updates
5. Save → verify the new image is shown on the detail page

---

## Running Tests

```bash
# Unit tests for file validation
npx jest tests/unit/lib/imageValidation --no-coverage

# All unit tests
npx jest tests/unit --no-coverage --forceExit

# TypeScript check
npx tsc --noEmit

# Full build
npm run build
```

---

## Supabase Storage — Manual Inspection

In the Supabase Dashboard → **Storage** → **recipe-images**:

- After uploading a recipe image, you should see a folder named `{your-user-id}/`
- Inside: `{recipe-id}.jpg` (or `.png`)
- Clicking the file → clicking **Get URL** should return a public URL that loads in a browser tab

---

## Environment Variables

No new environment variables required. The existing `.env.local` values cover Storage access:

```
NEXT_PUBLIC_SUPABASE_URL=...         # used by browser Supabase client for Storage upload
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # used by browser Supabase client (RLS enforces auth)
SUPABASE_SERVICE_ROLE_KEY=...       # used server-side for recipe delete cleanup only
```

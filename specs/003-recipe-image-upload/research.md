# Research: Recipe Image Upload

**Phase**: 0 — Pre-Design Research  
**Branch**: `003-recipe-image-upload`  
**Date**: 2026-03-17

---

## Decision 1: Upload Architecture — Direct Client vs. Server Proxy

**Decision**: Direct client-side upload to Supabase Storage using the browser Supabase client.

**Rationale**:  
- Vercel serverless Route Handlers have a **4.5 MB default body limit**. The spec allows 5 MB files, which would fail silently or require custom `bodyParser` config.
- Direct upload lets the browser stream the file straight to Supabase CDN — no file traverses the Next.js server.
- Supabase Storage RLS on `storage.objects` (scoped by `auth.uid()` prefix) enforces per-user isolation without any server-side auth proxy.
- The resulting `publicUrl` (a plain HTTPS string) is then included in the existing `POST /api/recipes` or `PUT /api/recipes/[id]` body — no new API route needed for the upload itself.

**Alternatives considered**:
- `POST /api/uploads/recipe-image` server proxy: rejected — body size limit on Vercel, adds latency, no security benefit over RLS.
- Pre-signed upload URL: valid pattern but over-engineered for this scale; direct upload with anon key + RLS is simpler.

---

## Decision 2: Upload Timing — On File Select vs. On Form Submit

**Decision**: Upload on **form submit**, not on file select.

**Rationale**:  
- Uploading on select produces orphaned files in Storage whenever the user abandons the form.
- Uploading on submit means the file is only stored when the recipe is actually saved.
- Preview is still instant (client-side `URL.createObjectURL()` — zero network cost).
- Trade-off: submit is slightly slower (sequential: upload → save recipe). Acceptable at ≤ 30 s per SC-001.

**Alternatives considered**:
- Upload on select + delete on cancel: complex cleanup logic, race conditions on navigation.
- Eager upload with a draft mechanism: over-engineered for this scope.

---

## Decision 3: Storage Path Convention

**Decision**: `{user_id}/{recipe_id}.{ext}` — e.g. `a1b2c3/d4e5f6.jpg`

**Rationale**:  
- First path segment = `auth.uid()` → RLS policy `(storage.foldername(name))[1] = auth.uid()::text` enforces ownership.
- Deterministic path (based on recipe ID) enables **upsert** on edit — same path, `upsert: true` overwrites the old image automatically.
- No separate file metadata table needed.

**Alternatives considered**:
- Random UUID filename: breaks upsert on edit — old file becomes orphan.
- Flat structure (no user prefix): RLS would require knowing the recipe owner; more complex policy.

---

## Decision 4: Bucket Visibility — Public vs. Private

**Decision**: **Public** bucket (`public = true` in `storage.buckets`).

**Rationale**:  
- Seed recipe images use stable public Unsplash URLs — they must be readable by browsers without auth headers.
- Uploaded recipe images are food photos — no privacy concern; a user sharing their recipe URL would want the image to load.
- `<Image src={publicUrl}>` / `<img src={publicUrl}>` work without session cookies.
- Per-user write isolation is still enforced via RLS INSERT/UPDATE/DELETE policies — public only affects SELECT.

**Alternatives considered**:
- Private bucket + signed URLs: unnecessary complexity; signed URLs expire and would break bookmarks.

---

## Decision 5: Seed Data Image Strategy

**Decision**: Replace the 20 local `/images/recipes/*.jpg` paths in `src/data/recipes.ts` with **stable Unsplash CDN URLs**.

**Rationale**:  
- Local paths reference files that do not exist in the repo → broken images on Vercel today.
- Unsplash CDN (`images.unsplash.com/photo-{id}`) is free for `<img>` tag usage, no API key required, and served from a global CDN.
- No upload to Supabase Storage needed for seed images — they remain external URLs, consistent with `photo_url` accepting any HTTPS URL.
- Zero infrastructure cost; can be updated independently.

**URLs mapped to seed recipes**:

| Recipe | Unsplash URL |
|--------|-------------|
| Spaghetti Carbonara | `https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80` |
| Avocado Toast | `https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=800&q=80` |
| Chicken Stir Fry | `https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80` |
| Greek Salad | `https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80` |
| Overnight Oats | `https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80` |
| Lentil Soup | `https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80` |
| Baked Salmon | `https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80` |
| Buddha Bowl | `https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80` |
| Fish Tacos | `https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80` |
| Smoothie Bowl | `https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80` |
| Mushroom Risotto | `https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80` |
| Pancakes | `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80` |
| Tuna Sandwich | `https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=800&q=80` |
| Chicken Curry | `https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80` |
| Scrambled Eggs | `https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80` |
| Caesar Salad | `https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80` |
| Tomato Soup | `https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=800&q=80` |
| Grilled Cheese | `https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80` |
| Fried Rice | `https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80` |
| Blueberry Muffins | `https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&q=80` |

---

## Decision 6: `next.config.ts` Remote Patterns

**Decision**: Add `remotePatterns` for `images.unsplash.com` and `*.supabase.co`.

**Rationale**:  
With `unoptimized: true`, Next.js `<Image>` skips optimization but still validates `src` against `remotePatterns` in some configurations. Adding patterns ensures no console warnings and forward-compatibility if `unoptimized` is removed later. Also required if optimization is ever enabled.

```ts
remotePatterns: [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: '*.supabase.co' },
]
```

---

## Decision 7: File Validation Location

**Decision**: Validate file size and MIME type **client-side only** (in `validateImageFile()` utility), before upload.

**Rationale**:  
- Supabase Storage bucket is configured with `file_size_limit = 5242880` and `allowed_mime_types = ['image/jpeg', 'image/png']` — server-side enforcement already exists at the storage level.
- Client-side validation prevents unnecessary network requests and gives instant user feedback per FR-003/FR-004.
- No need for duplicate server-side validation in a custom API route.

---

## Constitution Compliance (Post-Design)

All 5 Principles confirmed:
- **I**: Only Recipe Manager files touched — no Meal Planner or Grocery List changes.
- **II**: `photo_url` is stored on the `recipes` record, managed by existing recipe API.
- **III**: `imageValidation.test.ts` is the first file created in Phase 17.
- **IV**: Every task maps to a spec FR item. No extras.
- **V**: `002_storage_recipe_images.sql` is the versioned migration; additive only.

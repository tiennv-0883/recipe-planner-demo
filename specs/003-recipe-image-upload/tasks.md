# Tasks: Recipe Image Upload

**Input**: Design documents from `specs/003-recipe-image-upload/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/upload.md
**Branch**: `003-recipe-image-upload` | **Start ID**: T113

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US4)
- No story label = Setup / Foundational / Polish phase

> **Architecture note**: Images upload **directly from the browser** to Supabase Storage via the browser Supabase client. No custom API route is needed for upload — this avoids Vercel's 4.5 MB body limit. The resulting `publicUrl` is included in the existing `POST /api/recipes` or `PUT /api/recipes/[id]` body.

---

## Phase 17: Supabase Storage Setup + RLS

**Purpose**: Create the `recipe-images` Storage bucket with correct public access and per-user write policies. This phase BLOCKS all user story phases.

**⚠️ CRITICAL**: Complete T113 + T114 before any Phase 18+ work. T115 can run in parallel.

- [X] T113 Create `supabase/migrations/002_storage_recipe_images.sql` — INSERT into `storage.buckets` (public=true, 5 MB limit, JPEG+PNG only) + 4 RLS policies on `storage.objects` (public SELECT, authenticated INSERT/UPDATE/DELETE scoped to `auth.uid()` prefix via `storage.foldername(name)[1]`)
- [X] T114 Run `002_storage_recipe_images.sql` in Supabase SQL Editor; verify bucket `recipe-images` appears in Dashboard → Storage, marked Public
- [X] T115 [P] Update `next.config.ts` — add `remotePatterns` for `images.unsplash.com` and `*.supabase.co` alongside existing `unoptimized: true`

**Checkpoint**: Supabase bucket exists and is public. `npm run build` still passes.

---

## Phase 18: Image Validation Utility (US1 + US2)

**Purpose**: Pure client-side validation logic (file size ≤ 5 MB, MIME type JPEG/PNG). Written test-first per Constitution Principle III.

**Independent Test**: Run `npx jest tests/unit/lib/imageValidation` — all tests pass.

- [X] T116 Create `tests/unit/lib/imageValidation.test.ts` — unit tests for `validateImageFile()`: valid JPEG passes, valid PNG passes, file > 5 MB returns error, GIF returns error, PDF returns error, empty file returns error
- [X] T117 Create `src/lib/imageValidation.ts` — export `validateImageFile(file: File): { valid: true } | { valid: false; error: string }`, `MAX_FILE_SIZE = 5 * 1024 * 1024`, `ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png']`; run T116 tests — must pass green

**Checkpoint**: `npx jest tests/unit/lib/imageValidation --no-coverage` — 6+ tests pass.

---

## Phase 19: RecipeForm UI — Upload + Preview (US1 + US2)

**User Story 1 — Upload Image When Creating a Recipe (P1)**
**User Story 2 — Edit or Replace Image on an Existing Recipe (P2)**

**Goal**: Users can select a JPEG/PNG image in the Create and Edit Recipe forms. Preview shows instantly. Image uploads to Storage on form submit. `photoUrl` is stored in the recipe record.

**Independent Test (US1)**: Create a new recipe with an image → submit → recipe detail shows uploaded image → reload → image persists.
**Independent Test (US2)**: Open Edit Recipe (recipe with existing image) → current image shown as preview → select new file → preview updates → save → new image shown.

- [X] T118 [US1] Create `src/components/recipes/ImageUploadInput.tsx` — `'use client'` component accepting `{ currentUrl?: string; onFileSelect: (file: File | null) => void; error?: string }` props; renders styled click-to-upload area; shows `<img>` preview via `URL.createObjectURL(file)` on valid selection; calls `URL.revokeObjectURL()` on unmount; passes `accept="image/jpeg,image/png"` to `<input type="file">`; shows `error` prop as red text below input
- [X] T119 [US1] Update `src/components/recipes/RecipeForm.tsx` — import `ImageUploadInput` and `validateImageFile`; add `imageFile` state (`File | null`); add `imageError` state; add `pendingPhotoUrl` state (preview URL); render `<ImageUploadInput>` above the title field; on file select: run `validateImageFile()` → set error or accept file; include `pendingPhotoUrl` in `RecipeFormValues` passed to `onSubmit`
- [X] T120 [P] [US1] Update `src/app/recipes/new/page.tsx` — in the `onSubmit` handler: if `values.imageFile` is set, call `supabase.storage.from('recipe-images').upload('{userId}/{newRecipeId}.{ext}', file, { upsert: true })` → get `publicUrl`; set `values.photoUrl = publicUrl` before calling the recipe create API; use browser Supabase client (`createBrowserClient`) for upload
- [X] T121 [P] [US2] Update `src/app/recipes/[id]/edit/page.tsx` — pass `initialValues.photoUrl` as `currentUrl` to `ImageUploadInput`; in `onSubmit`: if new `imageFile` present, upload to same deterministic path `{userId}/{recipeId}.{ext}` with `upsert: true` → overwrite old image; set updated `publicUrl` on values before calling recipe update API; if no new file, keep existing `photoUrl` unchanged

**Checkpoint (US1)**: Create recipe with image → image shows on detail page → persists on reload.
**Checkpoint (US2)**: Edit recipe → current image shown → replace → new image shows after save.

---

## Phase 20: Seed Data Real Images (US4)

**User Story 4 — Seed Recipes Display Real Food Photographs (P3)**

**Goal**: Replace 20 broken local `/images/recipes/*.jpg` paths in seed data with stable Unsplash CDN URLs. No upload required — URL assignment only.

**Independent Test**: Register new account → 20 seed recipes load → every recipe shows a real food photograph. No broken image icons.

- [X] T122 [US4] Update `src/data/recipes.ts` — replace all 20 `photoUrl` values (currently local paths like `/images/recipes/pasta.jpg`) with stable Unsplash CDN URLs per the mapping in `research.md` (format: `https://images.unsplash.com/photo-{id}?w=800&q=80`)

**Checkpoint (US4)**: `npm run dev` → register new account → view My Recipes → all 20 seed recipes display real food photos.

---

## Phase 21: Storage Cleanup + Polish

**Purpose**: Ensure recipe deletion also removes the associated Storage object. Validate the placeholder fallback (US3). Final quality checks.

- [X] T123 [US3] Verify `src/components/recipes/RecipeCard.tsx` and `RecipeDetail` already render the SVG placeholder when `recipe.photoUrl` is falsy — no code change needed if placeholder is already implemented; confirm visually with a recipe that has no image
- [X] T124 Update `src/app/api/recipes/[id]/route.ts` — in the `DELETE` handler, after soft-delete: if `recipe.photo_url` contains `/recipe-images/` (i.e. is a Storage URL, not Unsplash), extract path and call `supabaseAdmin.storage.from('recipe-images').remove([path])` to clean up orphaned files
- [X] T125 [P] Run `npx tsc --noEmit` — confirm zero TypeScript errors across full codebase
- [X] T126 [P] Run `npx jest tests/unit --no-coverage --forceExit` — verify all unit tests pass (90 existing + new imageValidation tests)
- [X] T127 Run `npm run build` — verify production build passes with no errors

**Checkpoint**: Build passes. All tests green. No TypeScript errors. All 4 user stories verified manually.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 17 (Storage Setup)**: No dependencies — start immediately
- **Phase 18 (Validation Utility)**: Can start in parallel with Phase 17 (no dependency on bucket existing)
- **Phase 19 (RecipeForm UI)**: Depends on Phase 17 (bucket must exist) + Phase 18 (validation utility must exist)
- **Phase 20 (Seed Data)**: Independent of Phases 17–19 — can be done in parallel with Phase 19
- **Phase 21 (Polish)**: Depends on Phases 17–20 complete

### User Story Dependencies

- **US1 (Upload on Create)**: Depends on Phase 17 + Phase 18 complete
- **US2 (Edit/Replace)**: Depends on US1 (same infrastructure, same component)
- **US3 (Placeholder)**: Independent — already implemented in `RecipeCard`; only needs verification
- **US4 (Seed Images)**: Independent — URL-only change to `src/data/recipes.ts`

### Parallel Opportunities

- **Phase 17 + Phase 18**: Can run fully in parallel
- **Phase 17**: T115 (`next.config.ts`) runs in parallel with T113 + T114
- **Phase 19**: T120 (`new/page.tsx`) + T121 (`edit/page.tsx`) can run in parallel after T118 + T119
- **Phase 20**: T122 can run in parallel with all Phase 19 tasks
- **Phase 21**: T125 + T126 can run in parallel

---

## Parallel Example: Phase 19 (RecipeForm UI)

```bash
# Phase 17 + 18 can run simultaneously:
Task T113: "Create supabase/migrations/002_storage_recipe_images.sql"
Task T116: "Create tests/unit/lib/imageValidation.test.ts"
Task T117: "Create src/lib/imageValidation.ts"

# After T113 + T114 + T116 + T117 complete, these can run simultaneously:
Task T118: "Create src/components/recipes/ImageUploadInput.tsx"
Task T122: "Update src/data/recipes.ts with Unsplash URLs"

# After T118 + T119 complete, these can run simultaneously:
Task T120: "Update src/app/recipes/new/page.tsx"
Task T121: "Update src/app/recipes/[id]/edit/page.tsx"
```

---

## Implementation Strategy

### MVP (Phase 17 + 18 + 19 — US1 demonstrable)

1. Run Storage migration (T113 + T114)
2. Write validation utility tests + implementation (T116 + T117)
3. Build `ImageUploadInput` component (T118)
4. Wire into `RecipeForm` (T119)
5. Update Create Recipe page (T120)
6. **STOP and VALIDATE**: Create recipe with image → image persists → upload confirmed in Supabase Storage dashboard.

### Incremental Delivery

1. Phase 17 + 18 → Infrastructure + validation ready
2. Phase 19 T118–T120 → US1: Upload on Create works ✅
3. Phase 19 T121 → US2: Edit/Replace works ✅
4. Phase 20 → US4: Seed recipes show real images ✅
5. Phase 21 → US3 verified, cleanup, build green ✅

---

## Notes

- **No new npm packages required** — `@supabase/supabase-js` already installed
- **No new API route** — upload goes directly from browser to Supabase Storage via browser client (`createBrowserClient`); the resulting `publicUrl` is passed in the existing recipe API body
- **`photo_url` column already exists** in the `recipes` table (spec 002) — no schema column change
- **Placeholder already implemented** in `RecipeCard.tsx` — the SVG fallback renders when `recipe.photoUrl` is falsy (US3 is verification-only, T123)
- **Seed data fix is URL-only** — no uploads to Storage for seed images; Unsplash CDN URLs work directly in `<img>` tags without authentication
- **Upsert strategy** — using deterministic path `{userId}/{recipeId}.ext` with `upsert: true` means editing a recipe automatically overwrites the old image without cleanup logic
- **All existing 90 unit tests must remain green** — `imageValidation.ts` is a new pure function with no side effects on existing tests

---

## Bug Fixes

- [X] BUG-009 `new/page.tsx` and `edit/page.tsx` used local `dispatch` instead of calling the REST API — `photo_url` was uploaded to Storage but **never written to Supabase**. After F5, the API returned the old `photo_url` value.
  - **Root cause**: T120/T121 called `dispatch({ type: 'ADD' / 'UPDATE' })` (local reducer only), bypassing `POST /api/recipes` and `PUT /api/recipes/[id]`.
  - **Fix `edit/page.tsx`**: replaced `dispatch` with `apiDispatch({ type: 'UPDATE' })` — this calls `PUT /api/recipes/[id]`, which maps `photoUrl → photo_url` via `toDbRecipeInsert()` and persists to Supabase, then updates local state with the DB response.
  - **Fix `new/page.tsx`**: redesigned to a 3-step flow: (1) `POST /api/recipes` to get the DB-assigned UUID, (2) upload image to Storage using that UUID as path, (3) `PUT /api/recipes/{id}` to write `photoUrl`, then `dispatch` ADD with the final record.
  - **Files changed**: `src/app/recipes/new/page.tsx`, `src/app/recipes/[id]/edit/page.tsx`

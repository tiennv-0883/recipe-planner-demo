# Implementation Plan: Recipe Image Upload

**Branch**: `003-recipe-image-upload` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-recipe-image-upload/spec.md`

## Summary

Allow users to upload JPEG/PNG images (≤ 5 MB) when creating or editing recipes. Images are stored directly from the browser to a Supabase Storage public bucket `recipe-images` under per-user paths (`{user_id}/{recipe_id}.ext`) — bypassing the Next.js server to avoid Vercel's 4.5 MB body limit. A client-side preview is shown via `URL.createObjectURL()` before submit. The resulting public URL is stored in the existing `recipes.photo_url` column. Seed data is updated with stable Unsplash CDN URLs to replace the current broken local paths. The placeholder fallback in `RecipeCard` is already implemented and requires no changes.

## Technical Context

**Language/Version**: TypeScript 5.x strict  
**Primary Dependencies**: Next.js 15 App Router, `@supabase/supabase-js`, `@supabase/ssr`, React 18, Tailwind CSS  
**Storage**: Supabase Storage bucket `recipe-images` (public) + existing `recipes.photo_url` PostgreSQL column  
**Testing**: Jest — unit tests for client-side validation (file size, MIME type)  
**Target Platform**: Web (Vercel) — Node.js 20  
**Project Type**: Web application (Next.js App Router monorepo)  
**Performance Goals**: ≤ 30 s to select, preview, and save an image on broadband (SC-001)  
**Constraints**: Max 5 MB per file; JPEG and PNG only; path-scoped per user_id in Storage RLS  
**Scale/Scope**: Per-user image storage; 20 seed recipe URLs updated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I — Module Cohesion** | ✅ PASS | Touches only Recipe Manager module: RecipeForm, seed data, one new storage SQL migration. No Meal Planner or Grocery List changes. |
| **II — Recipe as Source of Truth** | ✅ PASS | `photo_url` is a field on the `recipes` record. Upload result is stored via the existing recipe update path. |
| **III — Test-First Development** | ✅ PASS | Unit tests for `validateImageFile()` (size + MIME type) written before `ImageUploadInput` implementation. |
| **IV — User-Centric Simplicity (YAGNI)** | ✅ PASS | All 11 FRs trace directly to spec user stories. No speculative features (no cropping, no AI tagging, no gallery). |
| **V — Data Integrity & Migration Safety** | ✅ PASS | No schema column added (`photo_url` exists from spec 002). Storage bucket creation is a new versioned SQL migration `002_storage_recipe_images.sql`. No destructive migrations. |

*Post-design re-check: see research.md § Constitution Compliance.*

## Project Structure

### Documentation (this feature)

```text
specs/003-recipe-image-upload/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── upload.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code Changes

```text
supabase/migrations/
└── 002_storage_recipe_images.sql     ← NEW: bucket INSERT + 4 RLS policies

src/
├── lib/
│   └── imageValidation.ts            ← NEW: validateImageFile() pure function
├── components/recipes/
│   ├── ImageUploadInput.tsx           ← NEW: file picker + preview + validation UI
│   └── RecipeForm.tsx                 ← UPDATE: add ImageUploadInput, wire photoUrl state
├── app/
│   └── recipes/
│       ├── new/page.tsx              ← UPDATE: pass photoUrl through onSubmit
│       └── [id]/edit/page.tsx        ← UPDATE: pass current photoUrl as initialValues
└── data/
    └── recipes.ts                    ← UPDATE: replace 20 local paths with Unsplash URLs

next.config.ts                        ← UPDATE: add remotePatterns for Supabase Storage + Unsplash

tests/unit/lib/
└── imageValidation.test.ts           ← NEW: unit tests for validateImageFile()
```

**Structure Decision**: Single Next.js project (App Router). No new API route needed — images upload directly from the browser to Supabase Storage via the browser Supabase client (RLS enforces user isolation). The public URL returned by Storage is stored in `photo_url` as part of the existing recipe create/update flow.


## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

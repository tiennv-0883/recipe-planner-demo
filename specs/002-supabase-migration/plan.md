# Implementation Plan: Supabase Backend Migration

**Branch**: `002-supabase-migration` | **Date**: 2026-03-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-supabase-migration/spec.md`

---

## Summary

Migrate the Recipe Planner app from localStorage + React Context to a Supabase backend
(PostgreSQL + Auth + Row Level Security). All data read/write operations are routed
through Next.js Route Handlers (`src/app/api/`), preserving the existing service
interfaces. The static export (`output: 'export'`) is removed to enable server-side
API Routes; Vercel deployment handles the Node.js runtime. Auth state is managed via
`@supabase/ssr` cookies and Next.js middleware. Existing service business logic
(pure functions) is retained unchanged; only the persistence layer changes.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20.x (Vercel runtime)
**Primary Dependencies**:
  - `@supabase/supabase-js` v2 -- Supabase JS client (auth + DB queries)
  - `@supabase/ssr` -- cookie-based session management for Next.js App Router
  - `next` v15 (App Router, Route Handlers)
  - `react` v18 + `react-dom` v18
  - `tailwindcss` v3

**Storage**: Supabase PostgreSQL (hosted, free tier)
  - Tables: `recipes`, `ingredient_lines`, `preparation_steps`, `meal_plans`,
    `meal_slots`, `grocery_lists`, `grocery_items`
  - Row Level Security enabled on every table; all policies are `auth.uid() = user_id`

**Testing**: Jest 29 (existing 90 unit tests retained); new unit tests for API route
  handlers and Supabase client helpers using `jest.mock('@supabase/supabase-js')`

**Target Platform**: Vercel (Node.js 20 runtime, Edge for middleware)
**Project Type**: Web application -- Next.js full-stack monolith (App Router)

**Performance Goals**:
  - Grocery list generation from 7-day plan: <= 500 ms server-side (constitution P95 SLA)
  - Page initial load: <= 5 seconds on mobile (SC-005)

**Constraints**:
  - `output: 'export'` MUST be removed (incompatible with API Routes)
  - `generateStaticParams` in dynamic route pages MUST be replaced with server-side
    rendering or removed (BUG-001 fix prerequisite)
  - Supabase free tier: 500 MB DB, 50 k MAU, 5 GB bandwidth -- sufficient for demo
  - All secrets via environment variables; `.env.local` never committed

**Scale/Scope**: Demo app, ~1--10 concurrent users, ~20 seed recipes + user-created data

---

## Constitution Check

*Gates checked against constitution.md v1.0.0. Re-checked after Phase 1 design.*

### Pre-Design Gate

| Principle | Check | Status |
|-----------|-------|--------|
| **I. Module Cohesion** | Recipe Manager, Meal Planner, Grocery Generator remain independently operable. API route layer is a new persistence adapter; it does not merge module concerns. Cross-module calls go only through defined service interfaces. | PASS |
| **II. Recipe as SSOT** | All ingredient data in meal plans and grocery lists still originates from Recipe Manager data. No new code path bypasses this flow. | PASS |
| **III. Test-First** | Unit tests for all new Route Handlers and Supabase helpers MUST be written before implementation. Existing 90 unit tests MUST continue to pass. BDD acceptance scenarios from spec MUST map to integration tests. | PASS (enforced in tasks) |
| **IV. YAGNI** | No speculative features added. Social login, real-time subscriptions, nutrition APIs, and price lookups are explicitly out of scope. | PASS |
| **V. Data Integrity & Migration** | This is a NEW database (no existing PostgreSQL to migrate). Schema includes `created_at`/`updated_at` on all tables. Soft-delete (`deleted_at`) preserved for recipes and meal plans. RLS enforced at DB level. | PASS |

**Architecture deviation (justified)**:
The constitution prescribes `backend/` + `frontend/` monorepo. The project uses a Next.js
monolith with `src/` established in spec 001. Refactoring to a split monorepo is out of
scope and unjustified by any user story (Principle IV). This deviation was accepted in
spec 001 and requires no new justification here. Documented in Complexity Tracking.

### Post-Design Gate *(fill after Phase 1)*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Module Cohesion | Confirmed -- see data-model.md | PASS |
| II. Recipe SSOT | Confirmed -- ingredient data flows via recipe_id FK | PASS |
| III. Test-First | Tests planned before each task group | PASS |
| V. Migration Safety | SQL migration in `supabase/migrations/` | PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-supabase-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── auth.md
│   ├── recipes.md
│   ├── meal-plans.md
│   └── grocery-lists.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/                         # NEW -- Route Handlers (backend layer)
│   │   ├── auth/
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── recipes/
│   │   │   ├── route.ts             # GET list, POST create
│   │   │   └── [id]/route.ts        # GET one, PUT update, DELETE soft-delete
│   │   ├── meal-plans/
│   │   │   ├── route.ts             # GET by week
│   │   │   └── [week]/
│   │   │       ├── route.ts         # GET plan
│   │   │       └── slots/route.ts   # POST assign, DELETE clear
│   │   └── grocery-lists/
│   │       └── [week]/
│   │           ├── route.ts         # GET list, POST generate
│   │           └── items/
│   │               └── [id]/route.ts # PATCH check, DELETE remove
│   ├── (auth)/                      # NEW -- auth page group
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/                       # NEW -- protected page group
│   │   └── layout.tsx               # auth guard
│   ├── recipes/
│   │   ├── [id]/
│   │   │   ├── page.tsx             # Server component (BUG-001 fix)
│   │   │   ├── RecipeDetailClient.tsx
│   │   │   └── edit/
│   │   │       ├── page.tsx         # Server component (BUG-001 fix)
│   │   │       └── RecipeEditClient.tsx
│   │   └── new/page.tsx
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # NEW -- browser Supabase client
│   │   ├── server.ts                # NEW -- server Supabase client (Route Handlers)
│   │   └── middleware.ts            # NEW -- session refresh helper
│   └── storage.ts                   # KEEP -- may remain for offline fallback
├── services/                        # KEEP -- pure business logic unchanged
│   ├── recipes.ts
│   ├── mealPlanner.ts
│   └── groceryList.ts
└── types/index.ts                   # KEEP -- domain types unchanged

middleware.ts                        # NEW -- @supabase/ssr session refresh

supabase/
└── migrations/
    └── 001_initial_schema.sql       # NEW -- full schema + RLS

tests/
├── unit/                            # existing 90 tests
└── api/                             # NEW -- Route Handler tests
```

**Structure Decision**: Next.js full-stack monolith retained from spec 001.
API Routes added under `src/app/api/` as the backend layer (replaces direct
localStorage access). Supabase clients isolated in `src/lib/supabase/`.
Business logic services remain pure functions in `src/services/`.

---

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Monolith instead of monorepo | Established in spec 001; splitting to `backend/`+`frontend/` would require large-scale refactor with no user story justification | No user story requests monorepo structure; YAGNI (Principle IV) |
| Route Handlers as backend layer | FR-013 requires server-side session validation before any DB access; client-side Supabase calls cannot enforce this | Direct Supabase browser calls bypass server-side auth check and expose RLS as the only guard -- insufficient for defence-in-depth |
| Remove `output: 'export'` | API Routes require a Node.js runtime; static export cannot run server-side code | Static export is fundamentally incompatible with Route Handlers; BUG-001 also makes static generation untenable without further refactoring |

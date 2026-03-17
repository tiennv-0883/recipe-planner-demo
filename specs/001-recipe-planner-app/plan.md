# Implementation Plan: Recipe Planner Web Application

**Branch**: `001-recipe-planner-app` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-recipe-planner-app/spec.md`

## Summary

Build a modern web dashboard for recipe planning with three core modules — Recipe Manager,
Meal Planner, and Grocery List Generator — as a **Next.js static site** (SSG/export). All
data is embedded as TypeScript mock data files; there is no backend or database. Client-side
React state (via Context API) manages meal plan assignments and grocery list check-off state.
Tailwind CSS drives all styling.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20  
**Primary Dependencies**: Next.js 15 (App Router, `output: 'export'`), Tailwind CSS 3, React 19  
**Storage**: None — all seed data in `src/data/*.ts`; runtime state in React Context + `localStorage` for persistence  
**Testing**: Jest 29 + React Testing Library 15 (unit/component), Playwright 1.x (e2e)  
**Target Platform**: Static web — CDN deployable (Vercel, Netlify, GitHub Pages)  
**Project Type**: Static web application (single-page dashboard with client-side routing)  
**Performance Goals**: Lighthouse Performance ≥ 90 on mobile; First Contentful Paint ≤ 1.5s  
**Constraints**: No server round-trips; all writes are in-memory + localStorage only; `next export` compatible (no `getServerSideProps`)  
**Scale/Scope**: ~5 pages, ~6 TypeScript entity types, ~20 mock recipes pre-seeded

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate question | Status |
|-----------|--------------|--------|
| **I — Module Cohesion** | Are Recipe Manager, Meal Planner, and Grocery List bounded by separate service files and directories? | ✅ PASS — enforced by `src/services/recipes.ts`, `src/services/mealPlanner.ts`, `src/services/groceryList.ts`; no cross-module direct data access |
| **I — Module Cohesion** | Does Grocery List read from Meal Planner output, not directly from recipe data? | ✅ PASS — `groceryList.ts` calls `mealPlanner.ts` service; never imports from `src/data/recipes.ts` directly |
| **II — Single Source of Truth** | Does all ingredient data originate from `src/data/recipes.ts`? | ✅ PASS — mock data is the one source; Meal Planner stores recipe IDs, Grocery List resolves ingredients via Recipe Manager service |
| **III — Test-First** | Will tests be written before implementation for business logic? | ✅ PASS — task plan will mandate Red→Green for all service functions |
| **IV — YAGNI** | Does the plan introduce anything beyond the 5 user stories in the spec? | ✅ PASS — no backend, no auth server, no DB; only what the spec requires |
| **V — Migration Safety** | Schema changes require a migration script — does this apply? | N/A — no database. TypeScript types serve as the schema contract; breaking type changes are caught at compile time. Noted in Complexity Tracking. |

**Post-design re-check**: ✅ All gates pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-recipe-planner-app/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── internal-services.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with sidebar
│   ├── page.tsx                  # Dashboard (/)
│   ├── recipes/
│   │   ├── page.tsx              # Recipe list (/recipes)
│   │   └── [id]/
│   │       └── page.tsx          # Recipe detail (/recipes/[id])
│   ├── meal-planner/
│   │   └── page.tsx              # Weekly meal planner (/meal-planner)
│   └── grocery-list/
│       └── page.tsx              # Grocery list (/grocery-list)
│
├── components/                   # Shared UI components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── recipes/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeList.tsx
│   │   ├── RecipeDetail.tsx
│   │   ├── RecipeForm.tsx
│   │   └── RecipeSearch.tsx
│   ├── meal-planner/
│   │   ├── WeekGrid.tsx
│   │   ├── MealSlot.tsx
│   │   └── RecipePicker.tsx
│   ├── grocery-list/
│   │   ├── GroceryGroup.tsx
│   │   ├── GroceryItem.tsx
│   │   └── AddItemForm.tsx
│   └── dashboard/
│       ├── WeekSummary.tsx
│       └── GroceryPreview.tsx
│
├── services/                     # Business logic (module boundary layer)
│   ├── recipes.ts                # Recipe CRUD over mock data + state
│   ├── mealPlanner.ts            # Meal slot assignment logic
│   └── groceryList.ts            # Aggregation + deduplication logic
│
├── context/                      # React Context providers
│   ├── RecipeContext.tsx
│   ├── MealPlanContext.tsx
│   └── GroceryContext.tsx
│
├── data/                         # Static mock data (embedded seed)
│   ├── recipes.ts                # ~20 mock Recipe objects
│   ├── categories.ts             # Ingredient → food category mapping
│   └── index.ts                  # Re-exports
│
├── types/                        # TypeScript entity interfaces
│   └── index.ts                  # Recipe, MealPlan, MealSlot, GroceryItem, …
│
└── lib/
    ├── storage.ts                # localStorage read/write helpers
    ├── ingredientUtils.ts        # Normalization + unit aggregation helpers
    └── weekUtils.ts              # ISO week helpers (current week, prev/next)

tests/
├── unit/
│   ├── services/
│   │   ├── recipes.test.ts
│   │   ├── mealPlanner.test.ts
│   │   └── groceryList.test.ts
│   └── lib/
│       ├── ingredientUtils.test.ts
│       └── weekUtils.test.ts
├── component/
│   ├── RecipeCard.test.tsx
│   ├── MealSlot.test.tsx
│   └── GroceryItem.test.tsx
└── e2e/
    ├── recipe-crud.spec.ts
    ├── meal-planner.spec.ts
    └── grocery-list.spec.ts

public/
└── images/
    └── recipes/                  # Static recipe photos (optional)
```

**Structure Decision**: Single Next.js project at repository root. No `frontend/` /
`backend/` split — there is no backend. All business logic lives in `src/services/` to
enforce module boundaries defined in Constitution Principle I.

## Complexity Tracking

| Item | Why Needed | Simpler Alternative Rejected Because |
|------|------------|--------------------------------------|
| React Context (3 providers) | Meal plan state and grocery check-off must survive navigation between pages without a database | Single `useState` in root layout would cause prop-drilling across 5 pages and make service layer testing impossible |
| `localStorage` persistence | Spec SC-007 requires data to persist across browser sessions | Without persistence, any page reload loses all meal plan and grocery state — directly fails SC-007 |
| TypeScript strict types as schema contract | Constitution Principle V requires schema versioning; no DB migrations needed | Breaking entity changes are surfaced at compile time; TypeScript type versioning replaces migration scripts for this static-site scope |

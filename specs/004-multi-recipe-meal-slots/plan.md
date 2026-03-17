# Implementation Plan: Multi-Recipe Meal Slots

**Branch**: `004-multi-recipe-meal-slots` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-multi-recipe-meal-slots/spec.md`

---

## Summary

Each meal slot in the Meal Planner currently holds exactly one recipe ID. This feature replaces the 1-to-1 constraint with a 1-to-many junction table (`meal_slot_recipes`), allowing 0–3 recipes per slot. The `MealSlot` TypeScript type changes from `recipeId: string` to `recipeIds: string[]`. The Grocery List generator is updated to flatten ingredients from all recipes across all slot entries. The MealGrid UI renders a compact list of recipe titles per cell with individual remove buttons and an "Add" affordance when below the 3-recipe limit.

---

## Technical Context

**Language/Version**: TypeScript 5 (strict), Next.js 15 App Router
**Primary Dependencies**: Supabase (PostgreSQL + RLS), `@supabase/ssr`, React 19, Tailwind CSS, Jest 29
**Storage**: Supabase PostgreSQL — new junction table `meal_slot_recipes`; `meal_slots.recipe_id` made nullable (deprecation) then dropped in a follow-up migration
**Testing**: Jest + ts-jest; unit tests in `tests/unit/`
**Target Platform**: Web (Vercel serverless + Supabase)
**Project Type**: Web application (Next.js full-stack monorepo)
**Performance Goals**: Grocery list generation ≤ 500 ms server-side at p95 (constitution IV); Meal Planner API response ≤ 300 ms p95
**Constraints**: Max 3 recipes per slot enforced in service layer (not DB CHECK); `meal_slots.recipe_id` retained nullable during this spec — hard removal scheduled for spec 005
**Scale/Scope**: Single-user per session; ~21 slots × 3 recipes max = 63 junction rows per week

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| **I — Module Cohesion** | Changes confined to Meal Planner (types, service, API, UI) and Grocery List (aggregation only). Recipe Manager not mutated. | ✅ PASS |
| **II — Recipe as Source of Truth** | `meal_slot_recipes.recipe_id` is a FK to `recipes.id`. Grocery List reads ingredients through Recipe objects — no ad-hoc ingredient data. | ✅ PASS |
| **III — Test-First** | Unit tests for `addRecipeToSlot`, `removeRecipeFromSlot`, `getAssignedRecipeIds` and updated `generateGroceryList` MUST be written before implementation. | ✅ REQUIRED — tasks enforce this order |
| **IV — User-Centric Simplicity** | All 4 user stories are traceable to concrete user flows in spec.md. No speculative features added. | ✅ PASS |
| **V — Migration Safety** | `003_multi_recipe_meal_slots.sql` is the versioned migration; adds new table + migrates old data + makes `recipe_id` nullable. `recipe_id` NOT dropped in this spec (deprecation period). | ✅ PASS |

**Gate result: PROCEED TO PHASE 0**

---

## Project Structure

### Documentation (this feature)

```text
specs/004-multi-recipe-meal-slots/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← migration SQL + TypeScript interfaces
├── quickstart.md        ← local setup + smoke tests
├── contracts/
│   └── slots.md         ← API contract changes
└── tasks.md             ← Phase 2 output (speckit.tasks)
```

### Source Code Map

```text
src/
├── types/index.ts
│   └── MealSlot.recipeId: string  →  recipeIds: string[]
│
├── services/
│   └── mealPlanner.ts
│       ├── assignRecipe()          →  addRecipeToSlot()  [new: appends, checks max 3]
│       ├── clearSlot()             →  clearSlot() + removeRecipeFromSlot() [new]
│       └── getAssignedRecipeIds()  →  updated flatMap over recipeIds[]
│
├── services/
│   └── groceryList.ts
│       └── generateGroceryList()  →  slot.recipeIds.flatMap(...)  [was: slot.recipeId]
│
├── lib/supabase/
│   ├── types.ts         →  DbMealSlot.recipe_id becomes optional; new DbMealSlotRecipe
│   └── mappers.ts       →  toDomainMealSlot now reads meal_slot_recipes[]
│
├── app/api/meal-plans/[week]/
│   ├── slots/route.ts   →  POST adds a recipe to slot (no longer replaces); checks max 3
│   └── slots/[slotId]/
│       ├── route.ts     →  DELETE clears entire slot (unchanged semantics)
│       └── recipes/[recipeId]/route.ts  ←  NEW: DELETE removes one recipe from slot
│
└── components/meal-planner/
    └── MealGrid.tsx     →  renders recipeIds[] list; per-recipe × button; Add button

tests/unit/
├── services/mealPlannerService.test.ts  →  updated + extended
└── services/groceryList.test.ts         →  updated: multi-recipe aggregation cases

supabase/migrations/
└── 003_multi_recipe_meal_slots.sql  ← CREATE junction table + migrate + make nullable
```

---

## Complexity Tracking

No constitution violations. No extra complexity introduced beyond what the user stories require.

---

## Post-Design Constitution Check

*Re-check after Phase 1 design artifacts are complete.*

| Principle | Post-Design Check | Status |
|-----------|-------------------|--------|
| **I** | New `meal_slot_recipes` table owned entirely by Meal Planner. Grocery List reads only through `Recipe` objects passed in — no cross-module DB query. | ✅ PASS |
| **II** | All ingredient data originates from `Recipe.ingredients` — Grocery List aggregation unchanged, just fed more inputs. | ✅ PASS |
| **III** | `mealPlannerService.test.ts` updated with failing tests for `addRecipeToSlot` and `removeRecipeFromSlot` BEFORE implementation tasks. `groceryList.test.ts` updated with multi-recipe cases. | ✅ REQUIRED |
| **IV** | `MAX_RECIPES_PER_SLOT = 3` constant is defined in service layer only — not in DB, not duplicated in UI logic (UI reads the slot length). | ✅ PASS |
| **V** | Migration `003_multi_recipe_meal_slots.sql` is additive: creates table, migrates data, makes column nullable. Hard removal of `recipe_id` deferred to spec 005. | ✅ PASS |

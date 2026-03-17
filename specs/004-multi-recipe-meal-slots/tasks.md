# Tasks: Multi-Recipe Meal Slots

**Input**: Design documents from `specs/004-multi-recipe-meal-slots/`
**Branch**: `004-multi-recipe-meal-slots`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/slots.md](./contracts/slots.md)
**Start Task ID**: T128 (continuing from spec 003 last task T127)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[US1]–[US4]**: Which user story this task primarily serves
- File paths are from project root

---

## Phase 22: Database Schema Migration

**Purpose**: Create the `meal_slot_recipes` junction table, migrate existing `meal_slots.recipe_id` data into it, and make the old column nullable. This is the foundational blocker for all other phases — no TypeScript, API, or UI changes should land before the DB is ready.

**⚠️ CRITICAL**: All subsequent phases depend on this migration being applied locally before implementation work begins.

- [X] T1XX Create `supabase/migrations/003_multi_recipe_meal_slots.sql` with the full SQL from `specs/004-multi-recipe-meal-slots/data-model.md` → SQL Migration section: (1) `CREATE TABLE public.meal_slot_recipes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slot_id uuid NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE, recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE, position integer NOT NULL DEFAULT 0, UNIQUE (slot_id, recipe_id))`, (2) `CREATE INDEX meal_slot_recipes_slot_id_idx ON public.meal_slot_recipes(slot_id)`, (3) `ALTER TABLE public.meal_slot_recipes ENABLE ROW LEVEL SECURITY`, (4) RLS policy `"user_owns_meal_slot_recipes"` — USING EXISTS join through `meal_slots` → `meal_plans` → `auth.uid()`, (5) `INSERT INTO public.meal_slot_recipes (slot_id, recipe_id, position) SELECT id, recipe_id, 0 FROM public.meal_slots WHERE recipe_id IS NOT NULL` (data migration), (6) `ALTER TABLE public.meal_slots ALTER COLUMN recipe_id DROP NOT NULL` (deprecation — do NOT drop the column)

**Checkpoint**: Migration file written. Run `supabase db reset` locally to verify it applies cleanly, then confirm `SELECT count(*) FROM meal_slot_recipes` matches old `meal_slots` rows that had a non-null `recipe_id`.

---

## Phase 23: Update TypeScript Types + Mapper

**Purpose**: Update all TypeScript interfaces to reflect `recipeIds: string[]` (was `recipeId: string`) and the new `DbMealSlotRecipe` Supabase type. The mapper must read from the joined junction rows. T129 and T130 have no dependency on each other (different files) and can run in parallel.

**⚠️ CRITICAL**: After T130 changes `MealSlot.recipeId` → `recipeIds`, TypeScript strict mode will surface every usage site as a compile error — those errors are the task list for Phases 24–27.

- [X] T1XX [P] Update `src/lib/supabase/types.ts` — (a) Change `DbMealSlot.recipe_id: string` → `recipe_id: string | null` (deprecation; column is now nullable per migration), (b) Add new interface `export interface DbMealSlotRecipe { id: string; slot_id: string; recipe_id: string; position: number }`, (c) Update `DbMealPlanWithSlots`: change `meal_slots: DbMealSlot[]` → `meal_slots: (DbMealSlot & { meal_slot_recipes: DbMealSlotRecipe[] })[]`

- [X] T1XX [P] Update `src/types/index.ts` — rename `recipeId: string` → `recipeIds: string[]` inside the `MealSlot` interface (around line 62); do NOT add any other fields to `MealSlot`

- [X] T1XX Update `src/lib/supabase/mappers.ts` — (a) Change signature of `toDomainMealSlot` to accept `db: DbMealSlot & { meal_slot_recipes?: DbMealSlotRecipe[] }`, (b) Replace the return's `recipeId: db.recipe_id` with `recipeIds: (db.meal_slot_recipes ?? []).sort((a, b) => a.position - b.position).map((r) => r.recipe_id)`, (c) In the `getMealPlan` / `getMealPlanForWeek` Supabase `.select()` call (wherever it currently reads `'*, meal_slots(*)'`), update it to `'*, meal_slots(*, meal_slot_recipes(*))'` so the junction rows are returned in the query response

**Checkpoint**: Run `npx tsc --noEmit` — expect errors only at call sites that still use `slot.recipeId` (those are the remaining tasks). The mapper, types, and DB types themselves should be error-free.

---

## Phase 24: Update API Routes

**Purpose**: Change POST `/slots` semantics from replace → append, create the new DELETE single-recipe route, and verify the existing clear-all route still works.

- [X] T1XX [US1] Update `src/app/api/meal-plans/[week]/slots/route.ts` — rewrite the POST handler as follows: (a) Authenticate user via Supabase session (unchanged), (b) Parse `{ day, mealType, recipeId }` from request body (shape unchanged), (c) Find-or-create slot: `SELECT id FROM meal_slots WHERE meal_plan_id = plan.id AND day = day AND meal_type = mealType`; if none, `INSERT INTO meal_slots (meal_plan_id, day, meal_type) VALUES (...) RETURNING id`, (d) Count existing recipes: `SELECT count(*) FROM meal_slot_recipes WHERE slot_id = slotId`; if count >= 3 return `{ error: 'SLOT_FULL' }` with status 409, (e) Check duplicate: query `meal_slot_recipes` for `(slot_id, recipe_id)` pair; if exists return `{ error: 'RECIPE_ALREADY_IN_SLOT' }` with status 409, (f) Insert: `INSERT INTO meal_slot_recipes (slot_id, recipe_id, position) VALUES (slotId, recipeId, count)`, (g) Re-fetch the updated slot with `meal_slot_recipes(*)` joined and return it via `toDomainMealSlot`; status 200

- [X] T1XX [US2] Create `src/app/api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]/route.ts` — implement the `DELETE` handler: (a) Authenticate user; verify slot ownership via `meal_slots → meal_plans → user_id = auth.uid()`; return 404 if not found, (b) Delete from `meal_slot_recipes` where `slot_id = slotId AND recipe_id = recipeId`; if 0 rows deleted return 404 `RECIPE_NOT_IN_SLOT`, (c) Count remaining rows in `meal_slot_recipes` for this `slotId`; if count === 0, delete the `meal_slots` row, (d) Return 204 No Content

- [X] T1XX [P] Verify `src/app/api/meal-plans/[week]/slots/[slotId]/route.ts` — confirm the existing `DELETE` handler deletes the `meal_slots` row; because `meal_slot_recipes.slot_id` has `ON DELETE CASCADE`, all junction rows are automatically removed. No logic change is expected — add an inline comment `// ON DELETE CASCADE removes meal_slot_recipes rows` above the delete statement to document this; confirm the route returns 204

**Checkpoint**: Run the 3 API scenarios from `specs/004-multi-recipe-meal-slots/quickstart.md` → Scenario A (add 2 recipes), Scenario B (remove one), Scenario C (max 3 limit).

---

## Phase 25: Update MealPlanContext

**Purpose**: Update the context's action types, reducer, and `apiDispatch` to match the new multi-recipe semantics. The page handler layer is updated to wire the new props.

- [X] T1XX [US1][US2] Update `src/context/MealPlanContext.tsx` — (a) In the `MealPlanAction` union type: rename `{ type: 'ASSIGN'; payload: { isoWeek, day, mealType, recipeId } }` → `{ type: 'ADD_RECIPE'; payload: { isoWeek: string; day: DayOfWeek; mealType: MealType; recipeId: string } }`, and add new `{ type: 'REMOVE_RECIPE'; payload: { isoWeek: string; slotId: string; recipeId: string } }`, (b) Update reducer `case 'ADD_RECIPE'`: find existing slot in `state[isoWeek].slots` matching `day + mealType`; if found, spread and set `recipeIds: [...slot.recipeIds, recipeId]`; if not found, create slot with `recipeIds: [recipeId]` and a temporary client-side `id`; (c) Add reducer `case 'REMOVE_RECIPE'`: find slot by `slotId`; set `recipeIds: slot.recipeIds.filter(id => id !== recipeId)`; if `recipeIds` becomes empty remove the slot from the plan's slots array entirely, (d) Update `apiDispatch case 'ADD_RECIPE'`: POST to `/api/meal-plans/${isoWeek}/slots` with `{ day, mealType, recipeId }`; on success dispatch `{ type: 'LOAD', ... }` with the returned plan (same pattern as old ASSIGN), (e) Add `apiDispatch case 'REMOVE_RECIPE'`: optimistically `dispatch(action)`, then `DELETE /api/meal-plans/${isoWeek}/slots/${slotId}/recipes/${recipeId}`; on error re-load the week plan to revert

- [X] T1XX [US1][US2] Update `src/app/meal-planner/page.tsx` — (a) Rename `handleAssign(day, mealType)` → `handleAddRecipe(day, mealType)` (opens RecipeSelector, stores pending slot — same logic, just renamed), (b) In `handleSelectRecipe(recipeId)`, dispatch `{ type: 'ADD_RECIPE', payload: { isoWeek, day, mealType, recipeId } }` (was `ASSIGN`), (c) Add `handleRemoveRecipe(slotId: string, recipeId: string)` which calls `apiDispatch({ type: 'REMOVE_RECIPE', payload: { isoWeek, slotId, recipeId } })`, (d) Update `<MealGrid>` props: replace `onAssign={handleAssign}` with `onAddRecipe={handleAddRecipe}`, replace `onClear={handleClear}` with `onRemoveRecipe={handleRemoveRecipe}`

**Checkpoint**: `npx tsc --noEmit` should now show errors only in `MealGrid.tsx` (which still has old prop types).

---

## Phase 26: Update MealGrid UI

**Purpose**: Render a list of recipe titles per cell with per-recipe × buttons and a conditional Add affordance. This phase is the only change to the UI component layer.

- [X] T1XX [US4] Update `src/components/meal-planner/MealGrid.tsx` — (a) Update the component props interface: remove `onAssign: (day: DayOfWeek, mealType: MealType) => void` and `onClear: (day: DayOfWeek, mealType: MealType) => void`; add `onAddRecipe: (day: DayOfWeek, mealType: MealType) => void` and `onRemoveRecipe: (slotId: string, recipeId: string) => void`, (b) Import `MAX_RECIPES_PER_SLOT` from `@/src/services/mealPlanner` (the constant added in Phase 25), (c) In the slot cell render: replace the single-recipe display with `slot.recipeIds.map(id => { const recipe = recipes.find(r => r.id === id); return recipe ? <div key={id}><span>{recipe.name}</span><button onClick={() => onRemoveRecipe(slot.id, id)}>×</button></div> : null })`, (d) Show the "Add recipe" button only when `slot.recipeIds.length < MAX_RECIPES_PER_SLOT`; clicking it calls `onAddRecipe(slot.day, slot.mealType)`, (e) When `slot.recipeIds.length === 0`, render the existing empty-slot placeholder — verify existing placeholder JSX already handles the zero-recipes case

**Checkpoint**: `npx tsc --noEmit` — zero TypeScript errors. Manual check: slot cell with 2 recipes shows both titles + ×; slot with 3 recipes has no Add button.

---

## Phase 27: Update Grocery Aggregation + GroceryContext

**Purpose**: Fix `generateGroceryList` to collect ingredients from all `recipeIds` per slot. The existing `aggregateIngredients()` helper is unchanged. GroceryContext.tsx delegates entirely to the service and needs only a fixture/type update if any test data references `recipeId`.

- [X] T1XX [US3] Update `src/services/groceryList.ts` — in `generateGroceryList`, find the line that reads `const recipe = recipesById[slot.recipeId]` (around line 13–16) and replace the ingredient collection expression with `return slot.recipeIds.flatMap(id => recipesById[id]?.ingredients ?? [])` inside the outer `plan.slots.flatMap(...)` callback; verify `aggregateIngredients()` is still called with the full flattened array

- [X] T1XX [P] Audit `src/context/GroceryContext.tsx` — search the file for any direct `slot.recipeId` or `recipeId` usage; there should be none (the context delegates entirely to `generateGroceryList()`); if none found, add a one-line comment `// generateGroceryList handles all slot.recipeIds iteration — no direct recipeId access here` and confirm the file compiles without changes; if any direct `recipeId` usage exists, update it to use `recipeIds` per the same flatMap pattern

**Checkpoint**: Run `npx jest tests/unit/services/groceryListService.test.ts --no-coverage` — tests must pass after fixture updates in Phase 28.

---

## Phase 28: Update Unit Tests + Verify

**Purpose**: Update all existing test fixtures from `recipeId` → `recipeIds`, add new tests for the multi-recipe slot management and grocery aggregation, and confirm the full suite passes. Tests are written in this phase (not test-first) because the implementation was not TDD in this spec.

- [X] T1XX [US1][US2] Update `tests/unit/services/mealPlannerService.test.ts` — (a) Replace every `recipeId: 'r-xxx'` fixture property with `recipeIds: ['r-xxx']` throughout the file, (b) Update every assertion using `slot.recipeId` → `slot.recipeIds[0]`, (c) Add test: calling `addRecipeToSlot` on a slot that already has 1 recipe returns a slot with `recipeIds.length === 2` and both IDs present, (d) Add test: calling `addRecipeToSlot` when `recipeIds.length === 3` throws an error or returns a rejection with code `SLOT_FULL`, (e) Add test: calling `addRecipeToSlot` with a `recipeId` already in `slot.recipeIds` throws or rejects with code `RECIPE_ALREADY_IN_SLOT`, (f) Add test: `removeRecipeFromSlot` with `recipeId = 'r-002'` on a slot that has `recipeIds: ['r-001', 'r-002']` returns a slot with `recipeIds: ['r-001']`, (g) Add test: `getAssignedRecipeIds` on a plan with 2 slots (`recipeIds: ['r-001']` and `recipeIds: ['r-002', 'r-003']`) returns `['r-001', 'r-002', 'r-003']`

- [X] T1XX [US3] Update `tests/unit/services/groceryListService.test.ts` — (a) Replace every `recipeId: 'r-xxx'` fixture in `MealSlot` objects with `recipeIds: ['r-xxx']`, (b) Add test: a slot with `recipeIds: ['r-001', 'r-002']` where Recipe r-001 has `{ name: 'garlic', amount: 3, unit: 'cloves' }` and r-002 has `{ name: 'garlic', amount: 2, unit: 'cloves' }` → grocery list shows garlic as `5 cloves` (aggregated), (c) Add test: a slot with `recipeIds: []` produces no ingredients from that slot, (d) Add test: two slots each containing the same recipe (same `recipeId` in `recipeIds`) correctly doubles the ingredient quantities

- [X] T1XX [P] Run `npx tsc --noEmit` — confirm zero TypeScript errors across the entire codebase; pay attention to any remaining `slot.recipeId` usages (there should be none); fix any residual references

- [X] T1XX [P] Run `npx jest tests/unit --no-coverage --forceExit` — all tests must pass; target ≥ 102 existing tests + new tests from T140 and T141; write test count in a comment at the bottom of this file

- [X] T1XX [P] Run `npm run build` — Next.js production build must complete with no TypeScript errors, no ESLint errors, and no compilation failures; confirm with the final "✓ Compiled" line in build output

---

## Dependencies

```
T128 (migration SQL)
  └─ T129 (DB types)     ─┐
  └─ T130 (domain types)  ├─ T131 (mapper)
                          └─ T131
T130 + T131
  └─ T132 (POST route)
  └─ T133 (DELETE recipe route)
  └─ T134 (verify clear route)
T132 + T133 + T134
  └─ T135 (MealPlanContext)
T135
  └─ T136 (page.tsx)
T136
  └─ T137 (MealGrid)
T130 + T138 (groceryList.ts)
  └─ T139 (GroceryContext audit — parallel)
T137 + T138 + T139
  └─ T140 (mealPlannerService tests)
  └─ T141 (groceryList tests)
T140 + T141
  └─ T142 (tsc check)
  └─ T143 (jest check)
  └─ T144 (build check)
```

### Parallel Execution Examples

**Phase 23** (after T128 complete): T129 and T130 can run simultaneously (different files):
```
Task T129: "Update src/lib/supabase/types.ts"
Task T130: "Update src/types/index.ts"
# Then, after both: Task T131 (mapper, depends on T129 + T130)
```

**Phase 24** (after T131 complete): T132, T133, T134 can all run simultaneously (different files):
```
Task T132: "Update src/app/api/meal-plans/[week]/slots/route.ts"
Task T133: "Create src/app/api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]/route.ts"
Task T134: "Verify src/app/api/meal-plans/[week]/slots/[slotId]/route.ts"
```

**Phase 27** (after T137 complete): T138 and T139 can run simultaneously:
```
Task T138: "Update src/services/groceryList.ts"
Task T139: "Audit src/context/GroceryContext.tsx"
```

**Phase 28** (after T141 complete): T142, T143, T144 can all run simultaneously:
```
Task T142: "Run npx tsc --noEmit"
Task T143: "Run npx jest tests/unit"
Task T144: "Run npm run build"
```

---

## Implementation Strategy

**MVP Scope — User Stories 1 + 3** (highest business value, both P1):
- Complete Phases 22–25 + Phase 27 → slots hold multiple recipes AND grocery list aggregates correctly across all of them
- US1 (add multi-recipe) + US3 (grocery aggregation) deliver end-to-end user value without the UI polish of US4

**Full Delivery**:
- Phase 26 (MealGrid UI) completes US4 — visual display of multiple recipes per cell
- Phase 28 (tests + verify) confirms stability

**Incremental delivery order**:
1. Phase 22 → migration applied ✅
2. Phase 23 → types consistent, TypeScript errors visible ✅
3. Phase 24 → API works, testable via curl ✅
4. Phase 25 → context wired, basic UI functional ✅
5. Phase 27 → grocery list correct ✅ ← MVP delivered
6. Phase 26 → full MealGrid multi-recipe render ✅
7. Phase 28 → tests green, build passes ✅

---

## Test Count
<!-- Update after T143: `npx jest tests/unit --no-coverage --forceExit 2>&1 | grep "Tests:"` -->
- Existing (spec 003 end): 102 tests
- New from T140: +7 tests (addRecipeToSlot×5, removeRecipeFromSlot×4, MAX_RECIPES_PER_SLOT×1, getAssignedRecipeIds multi×1)
- New from T141: +4 tests (empty recipeIds, multi-recipe slot aggregation×2, same recipe two slots)
- **Actual total: 116 tests ✅** (confirmed by T143 run)

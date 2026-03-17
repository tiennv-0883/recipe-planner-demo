# Quickstart: Multi-Recipe Meal Slots (Spec 004)

## Prerequisites

- Node.js 20+ and npm installed
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Local Supabase running (`supabase start`) and specs 001–003 migrations applied
- `.env.local` configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 1. Apply the DB Migration

```bash
# From project root
supabase migration new 003_multi_recipe_meal_slots
# Paste contents of specs/004-multi-recipe-meal-slots/data-model.md → SQL Migration section
# into supabase/migrations/003_multi_recipe_meal_slots.sql

supabase db reset
# (or: supabase migration up --local)
```

Verify:

```sql
-- Should show 3 tables: meal_plans, meal_slots, meal_slot_recipes
\dt public.*

-- Should show existing recipe assignments migrated into junction table
SELECT count(*) FROM public.meal_slot_recipes;
-- count should equal old count of meal_slots rows that had recipe_id NOT NULL

-- Old column should now be nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_slots' AND column_name = 'recipe_id';
-- is_nullable → YES
```

---

## 2. Run Existing Tests (should still pass before any code changes)

```bash
npm test
# Expected: 102 tests passing (TypeScript errors will appear once types are changed)
```

---

## 3. Update TypeScript Types First (TDD — tests before implementation)

Update `src/types/index.ts` and `src/lib/supabase/types.ts` first.

Immediately run:
```bash
npm run type-check
# Expected: errors at every `slot.recipeId` usage — these are your task list
```

---

## 4. Update Unit Tests Before Implementing

Update test fixtures in:
- `tests/unit/services/mealPlannerService.test.ts` — replace `recipeId` with `recipeIds: [...]`
- `tests/unit/services/groceryList.test.ts` — update fixtures

Add new failing tests for:
- `addRecipeToSlot` — happy path, max 3 guard, duplicate guard
- `removeRecipeFromSlot` — removes correct entry; slot still exists with remaining recipes
- `generateGroceryList` with multi-recipe slots — ingredients from both recipes appear in output

```bash
npm test
# Expected: newly added tests FAIL (red) — correct — implementation not written yet
```

---

## 5. Implement Changes

Follow the task order in `tasks.md` once generated. High-level sequence:

1. `src/lib/supabase/mappers.ts` — `toDomainMealSlot` reads `meal_slot_recipes[]`
2. `src/services/mealPlanner.ts` — `addRecipeToSlot`, `removeRecipeFromSlot`, update `getAssignedRecipeIds`
3. `src/services/groceryList.ts` — `flatMap` over `recipeIds`
4. `src/app/api/meal-plans/[week]/slots/route.ts` — POST append semantics
5. `src/app/api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]/route.ts` — new DELETE route
6. `src/components/meal-planner/MealGrid.tsx` — multi-recipe cell UI

```bash
npm test
# Expected: all tests pass (green)

npm run type-check
# Expected: 0 errors
```

---

## 6. Manual Smoke Test (Dev Server)

```bash
npm run dev
# Navigate to http://localhost:3000/meal-planner
```

**Scenario A — Add 2 recipes to one slot:**
1. Open Monday Lunch slot
2. Assign Recipe A → slot shows 1 recipe ×
3. Assign Recipe B → slot shows 2 recipes ×
4. Refresh page → both recipes persist

**Scenario B — Remove one recipe:**
1. Click × on Recipe A in Monday Lunch
2. Slot shows only Recipe B
3. Refresh → Recipe B persists, Recipe A gone

**Scenario C — Max 3 limit:**
1. Assign recipes A, B, C to Monday Lunch
2. Try to assign Recipe D → Add button is disabled OR 409 returned → error toast shown

**Scenario D — Grocery list aggregation:**
1. Assign Recipe A (ingredients: 200g flour, 1 egg) and Recipe B (ingredients: 100g flour, 50ml milk) to Monday Lunch
2. Open Grocery List
3. Expected: flour = 300g, egg = 1, milk = 50ml (aggregated)

**Scenario E — Clear slot:**
1. Monday Lunch has 2 recipes
2. Click "Clear slot"
3. Slot row removed from UI; refresh confirms empty

---

## 7. Verify Migration Safety

```sql
-- All original recipe assignments are preserved in junction table
SELECT ms.day, ms.meal_type, msr.recipe_id
FROM meal_slots ms
JOIN meal_slot_recipes msr ON msr.slot_id = ms.id
ORDER BY ms.day, ms.meal_type;

-- Old recipe_id column is NULL for new slots, populated for migrated ones
SELECT id, recipe_id FROM meal_slots LIMIT 10;
```

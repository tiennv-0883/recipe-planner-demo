# Data Model: Multi-Recipe Meal Slots

## SQL Migration — `003_multi_recipe_meal_slots.sql`

```sql
-- ============================================================
-- Migration 003: Multi-Recipe Meal Slots
-- Adds meal_slot_recipes junction table.
-- Migrates existing meal_slots.recipe_id data into it.
-- Makes meal_slots.recipe_id nullable (deprecation period).
-- recipe_id column HARD DROP deferred to spec 005.
-- ============================================================

-- 1. Junction table
CREATE TABLE public.meal_slot_recipes (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id    uuid    NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  recipe_id  uuid    NOT NULL REFERENCES public.recipes(id)    ON DELETE CASCADE,
  position   integer NOT NULL DEFAULT 0,
  UNIQUE (slot_id, recipe_id)
);

CREATE INDEX meal_slot_recipes_slot_id_idx ON public.meal_slot_recipes(slot_id);

-- 2. Row Level Security
ALTER TABLE public.meal_slot_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_meal_slot_recipes"
  ON public.meal_slot_recipes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM   public.meal_slots  ms
      JOIN   public.meal_plans  mp ON mp.id = ms.meal_plan_id
      WHERE  ms.id = meal_slot_recipes.slot_id
        AND  mp.user_id = auth.uid()
    )
  );

-- 3. Migrate existing data (preserves current single-recipe assignments)
INSERT INTO public.meal_slot_recipes (slot_id, recipe_id, position)
SELECT  id, recipe_id, 0
FROM    public.meal_slots
WHERE   recipe_id IS NOT NULL;

-- 4. Deprecate old column — NOT dropped yet
ALTER TABLE public.meal_slots ALTER COLUMN recipe_id DROP NOT NULL;
```

---

## TypeScript Interface Changes

### `src/types/index.ts`

```diff
 export interface MealSlot {
   id: string
   day: DayOfWeek
   mealType: MealType
-  recipeId: string
+  recipeIds: string[]
 }
```

### `src/lib/supabase/types.ts`

```diff
 export interface DbMealSlot {
   id: string
   meal_plan_id: string
   day: string
   meal_type: string
-  recipe_id: string
+  recipe_id: string | null   // deprecated; populated by migration; removed in spec 005
 }

+export interface DbMealSlotRecipe {
+  id: string
+  slot_id: string
+  recipe_id: string
+  position: number
+}

 export interface DbMealPlanWithSlots extends DbMealPlan {
-  meal_slots: DbMealSlot[]
+  meal_slots: (DbMealSlot & { meal_slot_recipes: DbMealSlotRecipe[] })[]
 }
```

### `src/lib/supabase/mappers.ts`

```diff
-export function toDomainMealSlot(db: DbMealSlot): MealSlot {
+export function toDomainMealSlot(
+  db: DbMealSlot & { meal_slot_recipes?: DbMealSlotRecipe[] }
+): MealSlot {
   return {
     id: db.id,
     day: db.day as DayOfWeek,
     mealType: db.meal_type as MealType,
-    recipeId: db.recipe_id,
+    recipeIds: (db.meal_slot_recipes ?? [])
+      .sort((a, b) => a.position - b.position)
+      .map((r) => r.recipe_id),
   }
 }
```

The Supabase query in `getMealPlan` / `getMealPlanForWeek` must include the join:

```diff
-.select('*, meal_slots(*)')
+.select('*, meal_slots(*, meal_slot_recipes(*))')
```

---

## Entity Relationship (updated)

```
users
 └─ meal_plans (user_id FK)
     └─ meal_slots (meal_plan_id FK)  — UNIQUE (meal_plan_id, day, meal_type)
         └─ meal_slot_recipes (slot_id FK)  — UNIQUE (slot_id, recipe_id); max 3 enforced in service
             └─ recipes (recipe_id FK)
```

---

## Service Layer API Diff

### `src/services/mealPlanner.ts`

| Current (spec 003) | New (spec 004) | Notes |
|--------------------|----------------|-------|
| `assignRecipe(plan, day, mealType, recipeId)` | `addRecipeToSlot(plan, day, mealType, recipeId)` | Appends; no replace; checks max 3 |
| `clearSlot(plan, day, mealType)` | `clearSlot(plan, day, mealType)` | Unchanged semantics: removes all recipes from slot |
| — | `removeRecipeFromSlot(plan, day, mealType, recipeId)` | Removes single recipe |
| `getAssignedRecipeIds(plan)` | `getAssignedRecipeIds(plan)` | Returns `plan.slots.flatMap(s => s.recipeIds)` |

**New constant**:
```typescript
export const MAX_RECIPES_PER_SLOT = 3
```

### `src/services/groceryList.ts`

```diff
-const recipe = recipesById[slot.recipeId]
-return recipe ? recipe.ingredients : []
+return slot.recipeIds.flatMap((id) => recipesById[id]?.ingredients ?? [])
```

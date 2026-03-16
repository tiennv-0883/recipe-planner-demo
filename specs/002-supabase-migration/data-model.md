# Data Model: Supabase Backend Migration

**Phase**: 1 | **Date**: 2026-03-14
**Derived from**: spec.md Key Entities, types/index.ts, research.md

---

## Entity Relationship Overview

```
auth.users (Supabase managed)
    |
    +-- user_profiles (1:1)
    |
    +-- recipes (1:N)
    |       |
    |       +-- ingredient_lines (1:N)
    |       +-- preparation_steps (1:N)
    |
    +-- meal_plans (1:N, unique per iso_week)
    |       |
    |       +-- meal_slots (1:N, unique per day+meal_type)
    |               |
    |               +-- recipe (N:1) --> recipes
    |
    +-- grocery_lists (1:N, unique per iso_week)
            |
            +-- grocery_items (1:N)
```

---

## Tables

### `user_profiles`

Extends `auth.users` with application-level metadata.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, FK → `auth.users(id)`, CASCADE DELETE | Matches Supabase user ID |
| `seeded_at` | `timestamptz` | NULL | Set when seed recipes are copied; NULL = not yet seeded |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

**Validation rules**: None beyond FK constraint.
**State transitions**: `seeded_at` NULL → timestamp (one-way, triggered by seed endpoint).

---

### `recipes`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)`, ON DELETE CASCADE | |
| `title` | `text` | NOT NULL, CHECK length >= 1 | |
| `photo_url` | `text` | NULL | Optional image URL |
| `cook_time_minutes` | `integer` | NOT NULL, CHECK >= 0 | |
| `servings` | `integer` | NOT NULL, CHECK >= 1 | |
| `tags` | `text[]` | NOT NULL, DEFAULT `'{}'` | Values from Tag enum |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |
| `deleted_at` | `timestamptz` | NULL | Soft-delete; NULL = active |

**Validation rules**:
- `title`: non-empty string
- `cook_time_minutes`: integer >= 0
- `servings`: integer >= 1
- `tags`: subset of `['breakfast','lunch','dinner','healthy','vegan','vegetarian']`

**State transitions**: `deleted_at` NULL → timestamp (soft-delete); no hard-delete from UI.

---

### `ingredient_lines`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `recipe_id` | `uuid` | NOT NULL, FK → `recipes(id)`, ON DELETE CASCADE | |
| `name` | `text` | NOT NULL, CHECK length >= 1 | Normalized to lowercase |
| `quantity` | `numeric(10,3)` | NOT NULL, CHECK > 0 | |
| `unit` | `text` | NOT NULL | e.g., "g", "ml", "cup" |
| `sort_order` | `integer` | NOT NULL, DEFAULT 0 | Display ordering |

**Normalization**: `name` stored in lowercase to satisfy Principle II (ingredient dedup).

---

### `preparation_steps`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `recipe_id` | `uuid` | NOT NULL, FK → `recipes(id)`, ON DELETE CASCADE | |
| `step_order` | `integer` | NOT NULL | 1-based ordering |
| `description` | `text` | NOT NULL, CHECK length >= 1 | |

UNIQUE constraint: `(recipe_id, step_order)`.

---

### `meal_plans`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)`, ON DELETE CASCADE | |
| `iso_week` | `text` | NOT NULL | Format: `YYYY-Www`, e.g. `2026-W11` |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

UNIQUE constraint: `(user_id, iso_week)`.

---

### `meal_slots`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `meal_plan_id` | `uuid` | NOT NULL, FK → `meal_plans(id)`, ON DELETE CASCADE | |
| `day` | `text` | NOT NULL | One of DayOfWeek enum values |
| `meal_type` | `text` | NOT NULL | One of `breakfast`, `lunch`, `dinner` |
| `recipe_id` | `uuid` | NOT NULL, FK → `recipes(id)`, ON DELETE CASCADE | |

UNIQUE constraint: `(meal_plan_id, day, meal_type)`.

**Constraint note**: `recipe_id` cascades on delete -- if a recipe is soft-deleted
the slot record still exists (recipe row is not hard-deleted). Application layer
treats "recipe not found" as a "(Recipe deleted)" placeholder display.

---

### `grocery_lists`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)`, ON DELETE CASCADE | |
| `iso_week` | `text` | NOT NULL | Format: `YYYY-Www` |
| `generated_at` | `timestamptz` | NULL | Set when auto-generated from meal plan |
| `updated_at` | `timestamptz` | NOT NULL, DEFAULT `now()` | |

UNIQUE constraint: `(user_id, iso_week)`.

---

### `grocery_items`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `grocery_list_id` | `uuid` | NOT NULL, FK → `grocery_lists(id)`, ON DELETE CASCADE | |
| `name` | `text` | NOT NULL | |
| `quantity` | `numeric(10,3)` | NOT NULL, CHECK >= 0 | |
| `unit` | `text` | NOT NULL | |
| `category` | `text` | NOT NULL | One of FoodCategory enum values |
| `checked` | `boolean` | NOT NULL, DEFAULT false | |
| `is_manual` | `boolean` | NOT NULL, DEFAULT false | Manual vs. auto-generated item |

---

## Row Level Security Policies

All tables enable RLS. Pattern: `auth.uid() = user_id` for top-level tables;
child tables join through parent for the auth check.

```sql
-- Top-level tables (user_profiles, recipes, meal_plans, grocery_lists)
CREATE POLICY "user_owns_row" ON <table>
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Child tables (ingredient_lines, preparation_steps)
CREATE POLICY "user_owns_via_recipe" ON ingredient_lines
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );

-- meal_slots -- join via meal_plans
CREATE POLICY "user_owns_via_meal_plan" ON meal_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM meal_plans
      WHERE meal_plans.id = meal_slots.meal_plan_id
        AND meal_plans.user_id = auth.uid()
    )
  );

-- grocery_items -- join via grocery_lists
CREATE POLICY "user_owns_via_grocery_list" ON grocery_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_items.grocery_list_id
        AND grocery_lists.user_id = auth.uid()
    )
  );
```

---

## TypeScript ↔ PostgreSQL Field Mapping

| TypeScript (types/index.ts) | PostgreSQL column | Notes |
|-----------------------------|-------------------|-------|
| `Recipe.id` | `recipes.id` | UUID |
| `Recipe.tags: Tag[]` | `recipes.tags: text[]` | Array |
| `Recipe.cookTimeMinutes` | `recipes.cook_time_minutes` | camelCase → snake_case |
| `Recipe.photoUrl` | `recipes.photo_url` | |
| `Recipe.deletedAt` | `recipes.deleted_at` | |
| `IngredientLine.quantity: number` | `ingredient_lines.quantity: numeric` | |
| `MealPlan.isoWeek` | `meal_plans.iso_week` | |
| `MealSlot.mealType` | `meal_slots.meal_type` | |
| `GroceryItem.isManual` | `grocery_items.is_manual` | |
| `GroceryItem.checked` | `grocery_items.checked` | |

All camelCase TypeScript fields map to snake_case PostgreSQL columns.
Type transformations are handled in Route Handler adapter functions
(`toDomainRecipe()`, `toDbRecipe()`, etc.).

---

## Migration File

Location: `supabase/migrations/001_initial_schema.sql`

This file contains the full DDL: table creation, constraints, indexes, and RLS policies.
It is run once in the Supabase SQL Editor before the first deploy.

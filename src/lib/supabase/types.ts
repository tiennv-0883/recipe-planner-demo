/**
 * PostgreSQL row types (snake_case) mirroring the database schema.
 * These are the raw shapes returned by Supabase queries.
 * Use mappers.ts to convert to/from domain types (camelCase).
 */

export interface DbUserProfile {
  id: string
  seeded_at: string | null
  created_at: string
  updated_at: string
}

export interface DbRecipe {
  id: string
  user_id: string
  title: string
  photo_url: string | null
  cook_time_minutes: number
  servings: number
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DbIngredientLine {
  id: string
  recipe_id: string
  name: string
  quantity: number
  unit: string
  sort_order: number
}

export interface DbPreparationStep {
  id: string
  recipe_id: string
  step_order: number
  description: string
}

export interface DbMealPlan {
  id: string
  user_id: string
  iso_week: string
  updated_at: string
}

export interface DbMealSlot {
  id: string
  meal_plan_id: string
  day: string
  meal_type: string
  recipe_id: string
}

export interface DbGroceryList {
  id: string
  user_id: string
  iso_week: string
  generated_at: string | null
  updated_at: string
}

export interface DbGroceryItem {
  id: string
  grocery_list_id: string
  name: string
  quantity: number
  unit: string
  category: string
  checked: boolean
  is_manual: boolean
}

/** Full recipe row joined with children (used in GET /api/recipes responses) */
export interface DbRecipeWithChildren extends DbRecipe {
  ingredient_lines: DbIngredientLine[]
  preparation_steps: DbPreparationStep[]
}

/** Full meal plan joined with slots */
export interface DbMealPlanWithSlots extends DbMealPlan {
  meal_slots: DbMealSlot[]
}

/** Full grocery list joined with items */
export interface DbGroceryListWithItems extends DbGroceryList {
  grocery_items: DbGroceryItem[]
}

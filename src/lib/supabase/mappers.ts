import type {
  DbGroceryListWithItems,
  DbIngredientLine,
  DbMealPlanWithSlots,
  DbMealSlot,
  DbMealSlotRecipe,
  DbPreparationStep,
  DbRecipeWithChildren,
} from '@/src/lib/supabase/types'
import type {
  FoodCategory,
  GroceryItem,
  GroceryList,
  IngredientLine,
  MealPlan,
  MealSlot,
  MealType,
  PreparationStep,
  Recipe,
  Tag,
} from '@/src/types'

// ─────────────────────────────────────────────────
//  Recipe mappers
// ─────────────────────────────────────────────────

function toIngredientLine(db: DbIngredientLine): IngredientLine {
  return {
    id: db.id,
    name: db.name,
    quantity: db.quantity,
    unit: db.unit,
  }
}

function toPreparationStep(db: DbPreparationStep): PreparationStep {
  return {
    order: db.step_order,
    description: db.description,
  }
}

export function toDomainRecipe(db: DbRecipeWithChildren): Recipe {
  return {
    id: db.id,
    title: db.title,
    photoUrl: db.photo_url ?? undefined,
    cookTimeMinutes: db.cook_time_minutes,
    servings: db.servings,
    tags: (db.tags ?? []) as Tag[],
    ingredients: (db.ingredient_lines ?? []).map(toIngredientLine),
    steps: (db.preparation_steps ?? [])
      .sort((a, b) => a.step_order - b.step_order)
      .map(toPreparationStep),
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    deletedAt: db.deleted_at ?? undefined,
  }
}

/** Returns the row shape for inserting into the `recipes` table. */
export function toDbRecipeInsert(
  r: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  userId: string,
): {
  user_id: string
  title: string
  photo_url: string | null
  cook_time_minutes: number
  servings: number
  tags: string[]
} {
  return {
    user_id: userId,
    title: r.title,
    photo_url: r.photoUrl ?? null,
    cook_time_minutes: r.cookTimeMinutes,
    servings: r.servings,
    tags: r.tags,
  }
}

export function toDbIngredientInsert(
  ing: IngredientLine,
  recipeId: string,
  sortOrder: number,
): Omit<DbIngredientLine, 'id'> {
  return {
    recipe_id: recipeId,
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit,
    sort_order: sortOrder,
  }
}

export function toDbPreparationStepInsert(
  step: PreparationStep,
  recipeId: string,
): Omit<DbPreparationStep, 'id'> {
  return {
    recipe_id: recipeId,
    step_order: step.order,
    description: step.description,
  }
}

// ─────────────────────────────────────────────────
//  Meal Plan mappers
// ─────────────────────────────────────────────────

function toDomainMealSlot(
  db: DbMealSlot & { meal_slot_recipes?: DbMealSlotRecipe[] },
): MealSlot {
  return {
    id: db.id,
    day: db.day as MealSlot['day'],
    mealType: db.meal_type as MealType,
    recipeIds: (db.meal_slot_recipes ?? [])
      .sort((a, b) => a.position - b.position)
      .map((r) => r.recipe_id),
  }
}

export function toDomainMealPlan(db: DbMealPlanWithSlots): MealPlan {
  return {
    isoWeek: db.iso_week,
    slots: (db.meal_slots ?? []).map(toDomainMealSlot),
    updatedAt: db.updated_at,
  }
}

// ─────────────────────────────────────────────────
//  Grocery List mappers
// ─────────────────────────────────────────────────

function toDomainGroceryItem(db: GroceryItemRow): GroceryItem {
  return {
    id: db.id,
    name: db.name,
    quantity: db.quantity,
    unit: db.unit,
    category: db.category as FoodCategory,
    checked: db.checked,
    isManual: db.is_manual,
  }
}

// Local alias so we don't need to import the joined variant
type GroceryItemRow = DbGroceryListWithItems['grocery_items'][number]

export function toDomainGroceryList(db: DbGroceryListWithItems): GroceryList {
  return {
    isoWeek: db.iso_week,
    items: (db.grocery_items ?? []).map(toDomainGroceryItem),
    generatedAt: db.generated_at ?? null,
    updatedAt: db.updated_at,
  }
}

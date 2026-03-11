// ─────────────────────────────────────────────────
//  Shared primitive types
// ─────────────────────────────────────────────────

export type Tag = 'breakfast' | 'lunch' | 'dinner' | 'healthy' | 'vegan' | 'vegetarian'

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type MealType = 'breakfast' | 'lunch' | 'dinner'

export type FoodCategory =
  | 'vegetables_fruits'
  | 'meat_fish'
  | 'dairy_eggs'
  | 'grains_bread'
  | 'spices_seasonings'
  | 'other'

// ─────────────────────────────────────────────────
//  Recipe Manager
// ─────────────────────────────────────────────────

export interface IngredientLine {
  id: string
  name: string
  quantity: number
  unit: string
}

export interface PreparationStep {
  order: number
  description: string
}

export interface Recipe {
  id: string
  title: string
  photoUrl?: string
  cookTimeMinutes: number
  servings: number
  tags: Tag[]
  ingredients: IngredientLine[]
  steps: PreparationStep[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

// ─────────────────────────────────────────────────
//  Meal Planner
// ─────────────────────────────────────────────────

export interface MealSlot {
  /** Unique id: `{isoWeek}-{day}-{mealType}` */
  id: string
  day: DayOfWeek
  mealType: MealType
  recipeId: string
}

export interface MealPlan {
  isoWeek: string
  slots: MealSlot[]
  updatedAt: string
}

// ─────────────────────────────────────────────────
//  Grocery List
// ─────────────────────────────────────────────────

export interface GroceryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: FoodCategory
  checked: boolean
  isManual: boolean
}

export interface GroceryList {
  isoWeek: string
  items: GroceryItem[]
  generatedAt: string | null
  updatedAt: string
}

// ─────────────────────────────────────────────────
//  Validation error types
// ─────────────────────────────────────────────────

export class RecipeValidationError extends Error {
  field: string
  constructor(field: string, message: string) {
    super(message)
    this.name = 'RecipeValidationError'
    this.field = field
  }
}

export class RecipeNotFoundError extends Error {
  id: string
  constructor(id: string) {
    super(`Recipe not found: ${id}`)
    this.name = 'RecipeNotFoundError'
    this.id = id
  }
}

export class GroceryItemNotFoundError extends Error {
  id: string
  constructor(id: string) {
    super(`Grocery item not found: ${id}`)
    this.name = 'GroceryItemNotFoundError'
    this.id = id
  }
}

export class ManualItemRequiredError extends Error {
  id: string
  constructor(id: string) {
    super(`Item ${id} is auto-generated and cannot be manually removed`)
    this.name = 'ManualItemRequiredError'
    this.id = id
  }
}

import type { Recipe, Tag } from '@/src/types'

type CreateRecipeInput = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
type UpdateRecipeInput = Partial<Omit<Recipe, 'id' | 'createdAt' | 'deletedAt'>>

/**
 * Return all non-deleted recipes, sorted by createdAt descending.
 */
export function listRecipes(recipes: Recipe[]): Recipe[] {
  return recipes
    .filter((r) => !r.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Find a non-deleted recipe by id. Returns undefined if not found or deleted.
 */
export function getRecipe(recipes: Recipe[], id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id && !r.deletedAt)
}

/**
 * Full-text search across title, ingredient names, and tags (case-insensitive).
 * Optionally filters by ALL provided tags (AND logic).
 * Returns only non-deleted recipes.
 */
export function searchRecipes(
  recipes: Recipe[],
  query: string,
  tags?: string[],
): Recipe[] {
  let active = recipes.filter((r) => !r.deletedAt)

  // Keyword search: title OR any ingredient name OR tags
  if (query.trim()) {
    const q = query.toLowerCase().trim()
    active = active.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(q)),
    )
  }

  // Multi-tag AND filter: recipe must include every selected tag
  if (tags && tags.length > 0) {
    active = active.filter((r) =>
      tags.every((tag) => r.tags.includes(tag as Tag)),
    )
  }

  return active
}

/**
 * Create a new Recipe entity with generated id and timestamps.
 */
export function createRecipe(input: CreateRecipeInput): Recipe {
  const now = new Date().toISOString()
  return {
    ...input,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Apply partial updates to a recipe and refresh updatedAt.
 * Returns a new object — does not mutate the original.
 */
export function updateRecipe(recipe: Recipe, changes: UpdateRecipeInput): Recipe {
  return {
    ...recipe,
    ...changes,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Soft-delete a recipe by setting deletedAt.
 * Returns a new object — does not mutate the original.
 */
export function deleteRecipe(recipe: Recipe): Recipe {
  return {
    ...recipe,
    deletedAt: new Date().toISOString(),
  }
}

/**
 * Check if a recipe id is referenced in any meal plan slot recipe ids.
 */
export function isRecipeInMealPlan(
  recipeId: string,
  assignedRecipeIds: string[],
): boolean {
  return assignedRecipeIds.includes(recipeId)
}

// ---- Internal ----

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

# Internal Service Contracts: Recipe Planner Web Application

**Branch**: `001-recipe-planner-app` | **Date**: 2026-03-11  
**Source**: `src/services/` — pure TypeScript functions; no network calls.

This document defines the public function signatures that each module exposes to the rest of
the application. These are the **module boundaries** enforced by Constitution Principle I.

> Rule: Components and Context providers MUST only call functions listed here.
> They MUST NOT import from `src/data/` directly (except Context initialisation).

---

## Module: Recipe Manager (`src/services/recipes.ts`)

All functions operate on a `Recipe[]` array passed in (pure functions — no global state access).
State ownership is in `RecipeContext`; the service functions are stateless utilities.

```ts
import type { Recipe } from '@/types';

/** Return all non-deleted recipes, sorted by updatedAt desc. */
function listRecipes(recipes: Recipe[]): Recipe[];

/** Return a single recipe by ID. Returns undefined if not found or soft-deleted. */
function getRecipe(recipes: Recipe[], id: string): Recipe | undefined;

/**
 * Search recipes by title keyword and/or ingredient name.
 * Both searches are partial-match, case-insensitive.
 * Tag filtering: recipe must contain ALL provided tags (AND logic).
 */
function searchRecipes(
  recipes: Recipe[],
  query: { keyword?: string; tags?: Tag[] }
): Recipe[];

/**
 * Add a new recipe. Generates id, createdAt, updatedAt.
 * Validates: title non-empty, ≥1 ingredient, ≥1 step.
 * Returns updated recipes array.
 * Throws RecipeValidationError if invalid.
 */
function createRecipe(
  recipes: Recipe[],
  input: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Recipe[];

/**
 * Update an existing recipe by ID.
 * Merges provided fields; updates updatedAt.
 * Returns updated recipes array.
 * Throws RecipeNotFoundError if id not found.
 * Throws RecipeValidationError if resulting state is invalid.
 */
function updateRecipe(
  recipes: Recipe[],
  id: string,
  patch: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>
): Recipe[];

/**
 * Soft-delete a recipe by setting deletedAt.
 * Returns updated recipes array.
 * Throws RecipeNotFoundError if id not found.
 */
function deleteRecipe(recipes: Recipe[], id: string): Recipe[];

/** Return whether a recipe ID is currently assigned in any meal slot of the given plan. */
function isRecipeInMealPlan(recipeId: string, plan: MealPlan): boolean;
```

**Errors**:
```ts
class RecipeValidationError extends Error { field: string; }
class RecipeNotFoundError extends Error { id: string; }
```

---

## Module: Meal Planner (`src/services/mealPlanner.ts`)

```ts
import type { MealPlan, MealSlot, DayOfWeek, MealType } from '@/types';

/**
 * Return the MealPlan for a given ISO week string.
 * If no plan exists yet, returns a new empty MealPlan (not persisted).
 */
function getMealPlan(plans: MealPlan[], isoWeek: string): MealPlan;

/**
 * Assign a recipe to a meal slot (day + meal).
 * Replaces existing assignment if slot was occupied.
 * Returns updated MealPlan.
 */
function assignRecipe(
  plan: MealPlan,
  day: DayOfWeek,
  meal: MealType,
  recipeId: string
): MealPlan;

/**
 * Clear a meal slot (set to empty / recipeId: null).
 * Returns updated MealPlan.
 */
function clearSlot(plan: MealPlan, day: DayOfWeek, meal: MealType): MealPlan;

/**
 * Return all MealSlots that have a non-null recipeId for the given plan.
 * Used by GroceryList Generator as its only data source from this module.
 */
function getFilledSlots(plan: MealPlan): MealSlot[];

/**
 * Return unique recipe IDs assigned in the plan (deduped).
 * Used by Dashboard summary.
 */
function getAssignedRecipeIds(plan: MealPlan): string[];

/** Return the ISO week string for the current date (e.g. "2026-W11"). */
function currentIsoWeek(): string;

/** Return the ISO week string for the week N weeks relative to the given week. */
function relativeIsoWeek(isoWeek: string, offset: number): string;
```

---

## Module: Grocery List Generator (`src/services/groceryList.ts`)

```ts
import type { GroceryList, GroceryItem, MealPlan, Recipe } from '@/types';

/**
 * Generate (or regenerate) the grocery list from the given meal plan.
 * - Resolves each slot's recipeId against the recipes array.
 * - Aggregates ingredients: same (normalizedName, unit) → sum quantities.
 * - Incompatible units → separate rows.
 * - Preserves isManual=true items from the existing list (not overwritten).
 * - Preserves `checked` state for items that still appear in the new list.
 * - Returns a new GroceryList; does NOT mutate the existing one.
 */
function generateGroceryList(
  plan: MealPlan,
  recipes: Recipe[],
  existing: GroceryList | null
): GroceryList;

/**
 * Toggle the checked state of a grocery item by id.
 * Returns updated GroceryList.
 */
function toggleItem(list: GroceryList, itemId: string): GroceryList;

/**
 * Update the quantity of a grocery item.
 * Returns updated GroceryList.
 * Throws GroceryItemNotFoundError if itemId not found.
 */
function updateItemQuantity(
  list: GroceryList,
  itemId: string,
  quantity: number
): GroceryList;

/**
 * Manually add an item to the grocery list.
 * isManual is set to true; category defaults to 'other' if not provided.
 * Returns updated GroceryList.
 */
function addManualItem(
  list: GroceryList,
  input: { name: string; quantity: number; unit: string; category?: FoodCategory }
): GroceryList;

/**
 * Remove a manually added item.
 * Throws if item is not manual (auto-generated items cannot be removed individually;
 * use generateGroceryList to recalculate).
 * Returns updated GroceryList.
 */
function removeManualItem(list: GroceryList, itemId: string): GroceryList;

/** Return items grouped by category, sorted within each group by displayOrder. */
function groupByCategory(
  list: GroceryList
): Record<FoodCategory, GroceryItem[]>;

/** Return count of unchecked items (for Dashboard preview). */
function uncheckedCount(list: GroceryList): number;
```

**Errors**:
```ts
class GroceryItemNotFoundError extends Error { id: string; }
class ManualItemRequiredError extends Error { id: string; }
```

---

## Cross-Module Dependency Rules

```
RecipeContext  ──uses──→ recipes.ts
MealPlanContext ──uses──→ mealPlanner.ts
                          └──calls──→ recipes.ts (isRecipeInMealPlan, getRecipe for slot resolution)
GroceryContext ──uses──→ groceryList.ts
                          └──calls──→ mealPlanner.ts (getFilledSlots)
                          └──calls──→ recipes.ts (getRecipe — to resolve ingredient lines)

Components ──import──→ Context only (never services directly, never src/data directly)
```

This enforces Constitution Principle I: each module has a single entry point and
ingredient data only flows Recipe Manager → Meal Planner → Grocery List.

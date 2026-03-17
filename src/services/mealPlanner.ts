import type { MealPlan, MealSlot, DayOfWeek, MealType } from '@/src/types'
import { currentIsoWeek, relativeIsoWeek } from '@/src/lib/weekUtils'

/** Maximum number of recipes allowed per meal slot. */
export const MAX_RECIPES_PER_SLOT = 3

/**
 * Get or create a meal plan for a given ISO week.
 */
export function getMealPlan(
  plans: Record<string, MealPlan>,
  isoWeek: string,
): MealPlan {
  return (
    plans[isoWeek] ?? {
      isoWeek,
      slots: [],
      updatedAt: new Date().toISOString(),
    }
  )
}

/**
 * Assign a recipe to a meal slot, replacing any existing assignment.
 * Returns a new MealPlan — does not mutate the input.
 * @deprecated Use addRecipeToSlot() for the new multi-recipe append semantics.
 */
export function assignRecipe(
  plan: MealPlan,
  day: DayOfWeek,
  mealType: MealType,
  recipeId: string,
): MealPlan {
  const id = `${plan.isoWeek}-${day}-${mealType}`
  const newSlot: MealSlot = { id, day, mealType, recipeIds: [recipeId] }
  const filtered = plan.slots.filter(
    (s) => !(s.day === day && s.mealType === mealType),
  )
  return {
    ...plan,
    slots: [...filtered, newSlot],
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Add a recipe to a meal slot, appending to existing assignments.
 * Throws if the slot already has MAX_RECIPES_PER_SLOT recipes.
 * Throws if the recipe is already present in the slot.
 * Returns a new MealPlan — does not mutate the input.
 */
export function addRecipeToSlot(
  plan: MealPlan,
  day: DayOfWeek,
  mealType: MealType,
  recipeId: string,
): MealPlan {
  const existing = plan.slots.find(
    (s) => s.day === day && s.mealType === mealType,
  )
  const currentIds = existing?.recipeIds ?? []

  if (currentIds.length >= MAX_RECIPES_PER_SLOT) {
    throw new Error('SLOT_FULL')
  }
  if (currentIds.includes(recipeId)) {
    throw new Error('RECIPE_ALREADY_IN_SLOT')
  }

  const slotId = existing?.id ?? `${plan.isoWeek}-${day}-${mealType}`
  const updatedSlot: MealSlot = {
    id: slotId,
    day,
    mealType,
    recipeIds: [...currentIds, recipeId],
  }
  const otherSlots = plan.slots.filter(
    (s) => !(s.day === day && s.mealType === mealType),
  )
  return {
    ...plan,
    slots: [...otherSlots, updatedSlot],
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Remove a single recipe from a meal slot.
 * If the slot becomes empty after removal, the slot is removed from the plan.
 * Returns a new MealPlan — does not mutate the input.
 */
export function removeRecipeFromSlot(
  plan: MealPlan,
  day: DayOfWeek,
  mealType: MealType,
  recipeId: string,
): MealPlan {
  const slot = plan.slots.find(
    (s) => s.day === day && s.mealType === mealType,
  )
  if (!slot) return plan

  const newRecipeIds = slot.recipeIds.filter((id) => id !== recipeId)
  const otherSlots = plan.slots.filter(
    (s) => !(s.day === day && s.mealType === mealType),
  )

  if (newRecipeIds.length === 0) {
    // Slot is now empty — remove it entirely
    return { ...plan, slots: otherSlots, updatedAt: new Date().toISOString() }
  }

  const updatedSlot: MealSlot = { ...slot, recipeIds: newRecipeIds }
  return {
    ...plan,
    slots: [...otherSlots, updatedSlot],
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Clear a single meal slot.
 * Returns a new MealPlan — does not mutate the input.
 */
export function clearSlot(
  plan: MealPlan,
  day: DayOfWeek,
  mealType: MealType,
): MealPlan {
  return {
    ...plan,
    slots: plan.slots.filter(
      (s) => !(s.day === day && s.mealType === mealType),
    ),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Return all filled slots in the plan.
 */
export function getFilledSlots(plan: MealPlan): MealSlot[] {
  return plan.slots
}

/**
 * Return unique recipe IDs assigned anywhere in the plan.
 */
export function getAssignedRecipeIds(plan: MealPlan): string[] {
  return Array.from(new Set(plan.slots.flatMap((s) => s.recipeIds)))
}

/**
 * Return the slot for a specific (day, mealType) combo, or undefined.
 */
export function getSlot(
  plan: MealPlan,
  day: DayOfWeek,
  mealType: MealType,
): MealSlot | undefined {
  return plan.slots.find((s) => s.day === day && s.mealType === mealType)
}

/** ISO week string for the current week */
export { currentIsoWeek }

/** ISO week string relative to a given base week */
export { relativeIsoWeek }

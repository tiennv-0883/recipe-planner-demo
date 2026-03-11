import type { MealPlan, MealSlot, DayOfWeek, MealType } from '@/src/types'
import { currentIsoWeek, relativeIsoWeek } from '@/src/lib/weekUtils'

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
 */
export function assignRecipe(
  plan: MealPlan,
  day: DayOfWeek,
  mealType: MealType,
  recipeId: string,
): MealPlan {
  const id = `${plan.isoWeek}-${day}-${mealType}`
  const newSlot: MealSlot = { id, day, mealType, recipeId }
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
 * Return unique recipe IDs assigned in the plan.
 */
export function getAssignedRecipeIds(plan: MealPlan): string[] {
  return Array.from(new Set(plan.slots.map((s) => s.recipeId)))
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

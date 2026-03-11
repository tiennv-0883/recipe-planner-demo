import {
  getMealPlan,
  assignRecipe,
  clearSlot,
  getFilledSlots,
  getAssignedRecipeIds,
  getSlot,
} from '@/src/services/mealPlanner'
import type { MealPlan } from '@/src/types'

const EMPTY_PLAN: MealPlan = {
  isoWeek: '2026-W11',
  slots: [],
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('mealPlannerService', () => {
  describe('getMealPlan', () => {
    it('returns existing plan for a given week', () => {
      const plans = { '2026-W11': EMPTY_PLAN }
      expect(getMealPlan(plans, '2026-W11')).toBe(EMPTY_PLAN)
    })

    it('returns an empty plan when week not found', () => {
      const result = getMealPlan({}, '2026-W11')
      expect(result.isoWeek).toBe('2026-W11')
      expect(result.slots).toEqual([])
    })
  })

  describe('assignRecipe', () => {
    it('adds a slot to an empty plan', () => {
      const result = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      expect(result.slots).toHaveLength(1)
      expect(result.slots[0]).toMatchObject({ day: 'monday', mealType: 'lunch', recipeId: 'r-001' })
    })

    it('replaces existing slot for same day/mealType', () => {
      const withSlot = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      const result = assignRecipe(withSlot, 'monday', 'lunch', 'r-002')
      expect(result.slots).toHaveLength(1)
      expect(result.slots[0].recipeId).toBe('r-002')
    })

    it('does not mutate the original plan', () => {
      assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      expect(EMPTY_PLAN.slots).toHaveLength(0)
    })

    it('updates the updatedAt timestamp', () => {
      const before = EMPTY_PLAN.updatedAt
      const result = assignRecipe(EMPTY_PLAN, 'tuesday', 'dinner', 'r-003')
      expect(result.updatedAt).not.toBe(before)
    })
  })

  describe('clearSlot', () => {
    it('removes the specified slot', () => {
      const withSlot = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      const result = clearSlot(withSlot, 'monday', 'lunch')
      expect(result.slots).toHaveLength(0)
    })

    it('does not affect other slots', () => {
      let plan = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      plan = assignRecipe(plan, 'tuesday', 'dinner', 'r-002')
      const result = clearSlot(plan, 'monday', 'lunch')
      expect(result.slots).toHaveLength(1)
      expect(result.slots[0].day).toBe('tuesday')
    })

    it('is a no-op on an empty plan', () => {
      const result = clearSlot(EMPTY_PLAN, 'monday', 'lunch')
      expect(result.slots).toHaveLength(0)
    })
  })

  describe('getFilledSlots', () => {
    it('returns all slots', () => {
      let plan = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      plan = assignRecipe(plan, 'tuesday', 'dinner', 'r-002')
      expect(getFilledSlots(plan)).toHaveLength(2)
    })

    it('returns empty array for empty plan', () => {
      expect(getFilledSlots(EMPTY_PLAN)).toHaveLength(0)
    })
  })

  describe('getAssignedRecipeIds', () => {
    it('returns unique recipe ids', () => {
      let plan = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      plan = assignRecipe(plan, 'tuesday', 'dinner', 'r-001')
      plan = assignRecipe(plan, 'wednesday', 'breakfast', 'r-002')
      const ids = getAssignedRecipeIds(plan)
      expect(ids).toHaveLength(2)
      expect(ids).toContain('r-001')
      expect(ids).toContain('r-002')
    })
  })

  describe('getSlot', () => {
    it('returns the slot for a given day and mealType', () => {
      const plan = assignRecipe(EMPTY_PLAN, 'monday', 'lunch', 'r-001')
      const slot = getSlot(plan, 'monday', 'lunch')
      expect(slot).toBeDefined()
      expect(slot!.recipeId).toBe('r-001')
    })

    it('returns undefined if slot not found', () => {
      expect(getSlot(EMPTY_PLAN, 'monday', 'lunch')).toBeUndefined()
    })
  })
})

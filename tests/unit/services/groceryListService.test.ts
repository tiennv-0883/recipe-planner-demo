import {
  generateGroceryList,
  toggleItem,
  updateItemQuantity,
  addManualItem,
  removeManualItem,
  groupByCategory,
  uncheckedCount,
} from '@/src/services/groceryList'
import type { GroceryList, GroceryItem, MealPlan } from '@/src/types'
import { SEED_RECIPES } from '@/src/data/recipes'

const recipesById = Object.fromEntries(SEED_RECIPES.map((r) => [r.id, r]))

const SIMPLE_PLAN: MealPlan = {
  isoWeek: '2026-W11',
  updatedAt: '2026-01-01T00:00:00Z',
  slots: [
    { id: 's1', day: 'monday', mealType: 'lunch', recipeIds: ['r-001'] }, // Tomato Basil Pasta
  ],
}

const EMPTY_LIST: GroceryList = {
  isoWeek: '2026-W11',
  items: [],
  generatedAt: null,
  updatedAt: '2026-01-01T00:00:00Z',
}

function makeItem(overrides: Partial<GroceryItem> = {}): GroceryItem {
  return {
    id: 'test-item',
    name: 'garlic',
    quantity: 2,
    unit: 'cloves',
    category: 'vegetables_fruits',
    checked: false,
    isManual: false,
    ...overrides,
  }
}

describe('groceryListService', () => {
  describe('generateGroceryList', () => {
    it('generates items from assigned recipes', () => {
      const list = generateGroceryList(SIMPLE_PLAN, recipesById)
      expect(list.items.length).toBeGreaterThan(0)
      expect(list.isoWeek).toBe('2026-W11')
      expect(list.generatedAt).toBeTruthy()
    })

    it('aggregates duplicate ingredients across recipes', () => {
      const planWithTwoSlots: MealPlan = {
        isoWeek: '2026-W11',
        updatedAt: '',
        slots: [
          { id: 's1', day: 'monday', mealType: 'lunch', recipeIds: ['r-001'] },
          { id: 's2', day: 'monday', mealType: 'dinner', recipeIds: ['r-001'] },
        ],
      }
      const list = generateGroceryList(planWithTwoSlots, recipesById)
      // All items should be aggregated (no duplicate name+unit combos)
      const names = list.items.map((i) => `${i.name}|${i.unit}`)
      const unique = new Set(names)
      expect(names.length).toBe(unique.size)
    })

    it('returns empty list for empty plan', () => {
      const emptyPlan: MealPlan = { isoWeek: '2026-W11', slots: [], updatedAt: '' }
      const list = generateGroceryList(emptyPlan, recipesById)
      expect(list.items).toHaveLength(0)
    })

    it('produces no ingredients from a slot with empty recipeIds', () => {
      const planWithEmptySlot: MealPlan = {
        isoWeek: '2026-W11',
        updatedAt: '',
        slots: [{ id: 's1', day: 'monday', mealType: 'lunch', recipeIds: [] }],
      }
      const list = generateGroceryList(planWithEmptySlot, recipesById)
      expect(list.items).toHaveLength(0)
    })

    it('aggregates ingredients from a multi-recipe slot', () => {
      // r-001 (Tomato Basil Pasta) is used twice — same recipe in both slots
      // aggregateIngredients() will sum quantities of same name+unit combos
      const planWithTwoRecipes: MealPlan = {
        isoWeek: '2026-W11',
        updatedAt: '',
        slots: [
          { id: 's1', day: 'monday', mealType: 'lunch', recipeIds: ['r-001', 'r-001'] },
        ],
      }
      const single = generateGroceryList(SIMPLE_PLAN, recipesById)
      const doubled = generateGroceryList(planWithTwoRecipes, recipesById)
      // Quantities should be doubled (same recipe applied twice)
      const singleTotal = single.items.reduce((sum, i) => sum + i.quantity, 0)
      const doubledTotal = doubled.items.reduce((sum, i) => sum + i.quantity, 0)
      expect(doubledTotal).toBeCloseTo(singleTotal * 2, 0)
    })

    it('uses same recipe across two different slots correctly', () => {
      // Two different slots each referencing r-001 — ingredients should be doubled
      const planWithTwoSlotsSameRecipe: MealPlan = {
        isoWeek: '2026-W11',
        updatedAt: '',
        slots: [
          { id: 's1', day: 'monday', mealType: 'lunch', recipeIds: ['r-001'] },
          { id: 's2', day: 'monday', mealType: 'dinner', recipeIds: ['r-001'] },
        ],
      }
      const single = generateGroceryList(SIMPLE_PLAN, recipesById)
      const doubled = generateGroceryList(planWithTwoSlotsSameRecipe, recipesById)
      const singleTotal = single.items.reduce((sum, i) => sum + i.quantity, 0)
      const doubledTotal = doubled.items.reduce((sum, i) => sum + i.quantity, 0)
      expect(doubledTotal).toBeCloseTo(singleTotal * 2, 0)
    })

    it('assigns categories to items', () => {
      const list = generateGroceryList(SIMPLE_PLAN, recipesById)
      list.items.forEach((item) => {
        expect(item.category).toBeTruthy()
      })
    })
  })

  describe('toggleItem', () => {
    it('toggles an unchecked item to checked', () => {
      const item = makeItem({ id: 'item-1', checked: false })
      const list = { ...EMPTY_LIST, items: [item] }
      const result = toggleItem(list, 'item-1')
      expect(result.items[0].checked).toBe(true)
    })

    it('toggles a checked item to unchecked', () => {
      const item = makeItem({ id: 'item-1', checked: true })
      const list = { ...EMPTY_LIST, items: [item] }
      const result = toggleItem(list, 'item-1')
      expect(result.items[0].checked).toBe(false)
    })

    it('does not mutate the original list', () => {
      const item = makeItem({ id: 'item-1' })
      const list = { ...EMPTY_LIST, items: [item] }
      toggleItem(list, 'item-1')
      expect(list.items[0].checked).toBe(false)
    })
  })

  describe('addManualItem', () => {
    it('adds a new manual item to the list', () => {
      const result = addManualItem(EMPTY_LIST, {
        name: 'extra cheese',
        quantity: 100,
        unit: 'g',
        category: 'dairy_eggs',
      })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].isManual).toBe(true)
      expect(result.items[0].name).toBe('extra cheese')
    })

    it('generates a unique id for the new item', () => {
      const r1 = addManualItem(EMPTY_LIST, { name: 'a', quantity: 1, unit: 'g', category: 'other' })
      const r2 = addManualItem(EMPTY_LIST, { name: 'b', quantity: 1, unit: 'g', category: 'other' })
      expect(r1.items[0].id).not.toBe(r2.items[0].id)
    })
  })

  describe('removeManualItem', () => {
    it('removes the item with the given id', () => {
      const item = makeItem({ id: 'del-me', isManual: true })
      const list = { ...EMPTY_LIST, items: [item] }
      const result = removeManualItem(list, 'del-me')
      expect(result.items).toHaveLength(0)
    })
  })

  describe('groupByCategory', () => {
    it('groups items by category', () => {
      const items: GroceryItem[] = [
        makeItem({ id: '1', category: 'vegetables_fruits' }),
        makeItem({ id: '2', category: 'dairy_eggs' }),
        makeItem({ id: '3', category: 'vegetables_fruits' }),
      ]
      const groups = groupByCategory(items)
      const vegGroup = groups.find((g) => g.category === 'vegetables_fruits')
      expect(vegGroup?.items).toHaveLength(2)
    })

    it('respects category ordering', () => {
      const items: GroceryItem[] = [
        makeItem({ id: '1', category: 'other' }),
        makeItem({ id: '2', category: 'vegetables_fruits' }),
      ]
      const groups = groupByCategory(items)
      expect(groups[0].category).toBe('vegetables_fruits')
    })
  })

  describe('uncheckedCount', () => {
    it('returns the number of unchecked items', () => {
      const list = {
        ...EMPTY_LIST,
        items: [
          makeItem({ id: '1', checked: false }),
          makeItem({ id: '2', checked: true }),
          makeItem({ id: '3', checked: false }),
        ],
      }
      expect(uncheckedCount(list)).toBe(2)
    })

    it('returns 0 for empty list', () => {
      expect(uncheckedCount(EMPTY_LIST)).toBe(0)
    })
  })
})

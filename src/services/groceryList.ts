import type { GroceryItem, GroceryList, MealPlan, FoodCategory } from '@/src/types'
import type { Recipe } from '@/src/types'
import { aggregateIngredients } from '@/src/lib/ingredientUtils'
import { classifyIngredient, FOOD_CATEGORY_ORDER } from '@/src/data/categories'

/**
 * Generate a GroceryList from the recipes assigned in a MealPlan.
 */
export function generateGroceryList(
  plan: MealPlan,
  recipesById: Record<string, Recipe>,
): GroceryList {
  const allIngredients = plan.slots.flatMap((slot) => {
    const recipe = recipesById[slot.recipeId]
    return recipe ? recipe.ingredients : []
  })

  const aggregated = aggregateIngredients(allIngredients)

  const items: GroceryItem[] = aggregated.map((agg, idx) => ({
    id: `gi-${idx}-${Date.now()}`,
    name: agg.name,
    quantity: agg.quantity,
    unit: agg.unit,
    category: classifyIngredient(agg.name),
    checked: false,
    isManual: false,
  }))

  return {
    isoWeek: plan.isoWeek,
    items,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Toggle the checked state of a grocery item.
 * Returns a new list — does not mutate.
 */
export function toggleItem(list: GroceryList, itemId: string): GroceryList {
  return {
    ...list,
    items: list.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item,
    ),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Update the quantity of a grocery item.
 * Returns a new list — does not mutate.
 */
export function updateItemQuantity(
  list: GroceryList,
  itemId: string,
  quantity: number,
): GroceryList {
  return {
    ...list,
    items: list.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item,
    ),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Add a manual item to the list.
 * Returns a new list — does not mutate.
 */
export function addManualItem(
  list: GroceryList,
  item: Omit<GroceryItem, 'id' | 'isManual' | 'checked'>,
): GroceryList {
  const newItem: GroceryItem = {
    ...item,
    id: `gm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isManual: true,
    checked: false,
  }
  return {
    ...list,
    items: [...list.items, newItem],
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Remove a manual item from the list.
 * Returns a new list — does not mutate.
 */
export function removeManualItem(list: GroceryList, itemId: string): GroceryList {
  return {
    ...list,
    items: list.items.filter((item) => item.id !== itemId),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Group grocery items by category, using a defined sort order.
 */
export function groupByCategory(items: GroceryItem[]): {
  category: FoodCategory
  items: GroceryItem[]
}[] {
  const map = new Map<FoodCategory, GroceryItem[]>()

  for (const item of items) {
    const cat = item.category
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(item)
  }

  return FOOD_CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
    category: cat,
    items: map.get(cat)!,
  }))
}

/**
 * Count unchecked items.
 */
export function uncheckedCount(list: GroceryList): number {
  return list.items.filter((item) => !item.checked).length
}

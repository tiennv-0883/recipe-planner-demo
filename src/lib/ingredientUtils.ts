import type { IngredientLine } from '@/src/types'

// ---- Normalise ingredient name ----

export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

// ---- Canonicalise unit ----

const UNIT_MAP: Record<string, string> = {
  kilogram: 'kg',
  kilograms: 'kg',
  kg: 'kg',
  gram: 'g',
  grams: 'g',
  gr: 'g',
  g: 'g',
  milligram: 'mg',
  milligrams: 'mg',
  mg: 'mg',
  liter: 'l',
  litre: 'l',
  liters: 'l',
  litres: 'l',
  l: 'l',
  milliliter: 'ml',
  millilitre: 'ml',
  milliliters: 'ml',
  millilitres: 'ml',
  ml: 'ml',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  tbsp: 'tbsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tsp: 'tsp',
  piece: 'pcs',
  pieces: 'pcs',
  pcs: 'pcs',
  clove: 'cloves',
  cloves: 'cloves',
  slice: 'slices',
  slices: 'slices',
  stalk: 'stalks',
  stalks: 'stalks',
}

export function canonicalizeUnit(unit: string): string {
  const lower = unit.toLowerCase()
  return UNIT_MAP[lower] ?? lower
}

// ---- Aggregate ----

export interface AggregatedIngredient {
  /** Normalised name */
  name: string
  quantity: number
  unit: string
}

/**
 * Aggregate a list of IngredientLine items by (normalizedName, canonicalUnit)
 * composite key, summing quantities.
 */
export function aggregateIngredients(ingredients: IngredientLine[]): AggregatedIngredient[] {
  const map = new Map<string, AggregatedIngredient>()

  for (const item of ingredients) {
    const name = normalizeIngredientName(item.name)
    const unit = canonicalizeUnit(item.unit)
    const key = `${name}|${unit}`

    const existing = map.get(key)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      map.set(key, { name, quantity: item.quantity, unit })
    }
  }

  return Array.from(map.values())
}

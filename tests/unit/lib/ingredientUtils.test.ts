import {
  normalizeIngredientName,
  canonicalizeUnit,
  aggregateIngredients,
} from '@/src/lib/ingredientUtils'
import type { IngredientLine } from '@/src/types'

describe('ingredientUtils', () => {
  describe('normalizeIngredientName', () => {
    it('trims whitespace', () => {
      expect(normalizeIngredientName('  basil  ')).toBe('basil')
    })

    it('converts to lowercase', () => {
      expect(normalizeIngredientName('CHICKEN BREAST')).toBe('chicken breast')
    })

    it('removes consecutive internal spaces', () => {
      expect(normalizeIngredientName('olive  oil')).toBe('olive oil')
    })
  })

  describe('canonicalizeUnit', () => {
    it('normalizes "kilogram" to "kg"', () => {
      expect(canonicalizeUnit('kilogram')).toBe('kg')
    })

    it('normalizes "kilograms" to "kg"', () => {
      expect(canonicalizeUnit('kilograms')).toBe('kg')
    })

    it('keeps "kg" as "kg"', () => {
      expect(canonicalizeUnit('kg')).toBe('kg')
    })

    it('normalizes "gram" to "g"', () => {
      expect(canonicalizeUnit('gram')).toBe('g')
    })

    it('normalizes "grams" to "g"', () => {
      expect(canonicalizeUnit('grams')).toBe('g')
    })

    it('normalizes "gr" to "g"', () => {
      expect(canonicalizeUnit('gr')).toBe('g')
    })

    it('keeps "g" as "g"', () => {
      expect(canonicalizeUnit('g')).toBe('g')
    })

    it('normalizes "milliliter" to "ml"', () => {
      expect(canonicalizeUnit('milliliter')).toBe('ml')
    })

    it('normalizes "millilitre" to "ml"', () => {
      expect(canonicalizeUnit('millilitre')).toBe('ml')
    })

    it('normalizes "liter" to "l"', () => {
      expect(canonicalizeUnit('liter')).toBe('l')
    })

    it('normalizes "litre" to "l"', () => {
      expect(canonicalizeUnit('litre')).toBe('l')
    })

    it('normalizes "tablespoon" to "tbsp"', () => {
      expect(canonicalizeUnit('tablespoon')).toBe('tbsp')
    })

    it('normalizes "teaspoon" to "tsp"', () => {
      expect(canonicalizeUnit('teaspoon')).toBe('tsp')
    })

    it('normalizes "piece" to "pcs"', () => {
      expect(canonicalizeUnit('piece')).toBe('pcs')
    })

    it('normalizes "pieces" to "pcs"', () => {
      expect(canonicalizeUnit('pieces')).toBe('pcs')
    })

    it('lowercases the unit before matching', () => {
      expect(canonicalizeUnit('GRAM')).toBe('g')
    })

    it('returns unknown units unchanged (lowercased)', () => {
      expect(canonicalizeUnit('bunch')).toBe('bunch')
    })
  })

  describe('aggregateIngredients', () => {
    const makeIngredient = (
      id: string,
      name: string,
      quantity: number,
      unit: string,
    ): IngredientLine => ({ id, name, quantity, unit })

    it('sums quantities for identical name+unit pairs', () => {
      const items: IngredientLine[] = [
        makeIngredient('1', 'garlic', 2, 'cloves'),
        makeIngredient('2', 'garlic', 3, 'cloves'),
      ]
      const result = aggregateIngredients(items)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(5)
      expect(result[0].unit).toBe('cloves')
    })

    it('keeps different units separate', () => {
      const items: IngredientLine[] = [
        makeIngredient('1', 'water', 200, 'ml'),
        makeIngredient('2', 'water', 1, 'l'),
      ]
      const result = aggregateIngredients(items)
      expect(result).toHaveLength(2)
    })

    it('normalizes names before grouping', () => {
      const items: IngredientLine[] = [
        makeIngredient('1', '  Garlic  ', 2, 'cloves'),
        makeIngredient('2', 'garlic', 3, 'cloves'),
      ]
      const result = aggregateIngredients(items)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(5)
      expect(result[0].name).toBe('garlic')
    })

    it('canonicalizes units before grouping', () => {
      const items: IngredientLine[] = [
        makeIngredient('1', 'butter', 100, 'grams'),
        makeIngredient('2', 'butter', 50, 'g'),
      ]
      const result = aggregateIngredients(items)
      expect(result).toHaveLength(1)
      expect(result[0].quantity).toBe(150)
      expect(result[0].unit).toBe('g')
    })

    it('handles empty array', () => {
      expect(aggregateIngredients([])).toEqual([])
    })

    it('returns a new array without mutating input', () => {
      const items: IngredientLine[] = [makeIngredient('1', 'oil', 1, 'tbsp')]
      const result = aggregateIngredients(items)
      expect(result).not.toBe(items)
    })
  })
})

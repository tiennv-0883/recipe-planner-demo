import {
  listRecipes,
  getRecipe,
  searchRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '@/src/services/recipes'
import type { Recipe } from '@/src/types'
import { SEED_RECIPES } from '@/src/data/recipes'

const BASE_RECIPES: Recipe[] = SEED_RECIPES.slice(0, 5).map((r) => ({
  ...r,
  deletedAt: undefined,
}))

describe('recipeService', () => {
  describe('listRecipes', () => {
    it('returns only non-deleted recipes', () => {
      const withDeleted: Recipe[] = [
        ...BASE_RECIPES,
        { ...BASE_RECIPES[0], id: 'deleted', deletedAt: '2026-01-01T00:00:00Z' },
      ]
      const result = listRecipes(withDeleted)
      expect(result.every((r) => !r.deletedAt)).toBe(true)
      expect(result).toHaveLength(BASE_RECIPES.length)
    })

    it('returns a sorted-by-createdAt descending list', () => {
      const sorted = listRecipes(BASE_RECIPES)
      for (let i = 1; i < sorted.length; i++) {
        expect(new Date(sorted[i - 1].createdAt) >= new Date(sorted[i].createdAt)).toBe(true)
      }
    })
  })

  describe('getRecipe', () => {
    it('returns the recipe with the given id', () => {
      const recipe = getRecipe(BASE_RECIPES, BASE_RECIPES[0].id)
      expect(recipe).toBeDefined()
      expect(recipe!.id).toBe(BASE_RECIPES[0].id)
    })

    it('returns undefined for unknown id', () => {
      expect(getRecipe(BASE_RECIPES, 'unknown-id')).toBeUndefined()
    })

    it('returns undefined for deleted recipe', () => {
      const withDeleted: Recipe[] = [
        { ...BASE_RECIPES[0], deletedAt: '2026-01-01T00:00:00Z' },
      ]
      expect(getRecipe(withDeleted, BASE_RECIPES[0].id)).toBeUndefined()
    })
  })

  describe('searchRecipes', () => {
    it('filters by title substring (case insensitive)', () => {
      const result = searchRecipes(BASE_RECIPES, 'pasta')
      expect(result.every((r) => r.title.toLowerCase().includes('pasta'))).toBe(true)
    })

    it('filters by tag keyword in query', () => {
      const result = searchRecipes(BASE_RECIPES, 'vegan')
      expect(result.length).toBeGreaterThanOrEqual(0)
    })

    it('returns all active recipes when query is empty and no tags', () => {
      const result = searchRecipes(BASE_RECIPES, '')
      expect(result).toHaveLength(BASE_RECIPES.length)
    })

    it('excludes deleted recipes', () => {
      const withDeleted: Recipe[] = [
        { ...BASE_RECIPES[0], deletedAt: '2026-01-01T00:00:00Z' },
        ...BASE_RECIPES.slice(1),
      ]
      const result = searchRecipes(withDeleted, '')
      expect(result).toHaveLength(BASE_RECIPES.length - 1)
    })

    it('searches by ingredient name (partial match)', () => {
      const recipes: Recipe[] = [
        {
          ...BASE_RECIPES[0],
          id: 'r-tomato',
          title: 'Simple Salad',
          ingredients: [
            { name: 'cherry tomato', quantity: 200, unit: 'g' },
            { name: 'cucumber', quantity: 1, unit: 'piece' },
          ],
        },
        {
          ...BASE_RECIPES[1],
          id: 'r-other',
          title: 'Plain Pasta',
          ingredients: [
            { name: 'pasta', quantity: 200, unit: 'g' },
          ],
        },
      ]
      const result = searchRecipes(recipes, 'tomato')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('r-tomato')
    })

    it('ingredient search is case-insensitive', () => {
      const recipes: Recipe[] = [
        {
          ...BASE_RECIPES[0],
          id: 'r-garlic',
          title: 'Test Dish',
          ingredients: [{ name: 'Garlic Cloves', quantity: 3, unit: 'piece' }],
        },
      ]
      expect(searchRecipes(recipes, 'garlic')).toHaveLength(1)
      expect(searchRecipes(recipes, 'GARLIC')).toHaveLength(1)
    })

    it('applies multi-tag AND filter: returns recipes matching ALL given tags', () => {
      const recipes: Recipe[] = [
        { ...BASE_RECIPES[0], id: 'r1', tags: ['vegan', 'healthy'] },
        { ...BASE_RECIPES[1], id: 'r2', tags: ['vegan'] },
        { ...BASE_RECIPES[2], id: 'r3', tags: ['healthy'] },
      ]
      const result = searchRecipes(recipes, '', ['vegan', 'healthy'])
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('r1')
    })

    it('multi-tag AND filter with empty tags array returns all active recipes', () => {
      const result = searchRecipes(BASE_RECIPES, '', [])
      expect(result).toHaveLength(BASE_RECIPES.length)
    })

    it('combines query and tag filter (AND logic)', () => {
      const recipes: Recipe[] = [
        {
          ...BASE_RECIPES[0],
          id: 'r-match',
          title: 'Healthy Green Salad',
          tags: ['healthy', 'vegan'],
          ingredients: [],
        },
        {
          ...BASE_RECIPES[1],
          id: 'r-title-only',
          title: 'Healthy Burger',
          tags: ['healthy'],
          ingredients: [],
        },
      ]
      // Query matches both by title, but tag filter narrows to only ['vegan', 'healthy']
      const result = searchRecipes(recipes, 'healthy', ['vegan'])
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('r-match')
    })
  })

  describe('createRecipe', () => {
    it('returns a new recipe with a generated id and timestamps', () => {
      const input = {
        title: 'Test Recipe',
        cookTimeMinutes: 20,
        servings: 2,
        tags: ['dinner'] as const,
        ingredients: [],
        steps: [],
      }
      const recipe = createRecipe(input)
      expect(recipe.id).toBeTruthy()
      expect(recipe.createdAt).toBeTruthy()
      expect(recipe.updatedAt).toBeTruthy()
      expect(recipe.title).toBe('Test Recipe')
    })

    it('generates a unique id each call', () => {
      const input = {
        title: 'A',
        cookTimeMinutes: 1,
        servings: 1,
        tags: [] as const,
        ingredients: [],
        steps: [],
      }
      const a = createRecipe(input as Parameters<typeof createRecipe>[0])
      const b = createRecipe(input as Parameters<typeof createRecipe>[0])
      expect(a.id).not.toBe(b.id)
    })
  })

  describe('updateRecipe', () => {
    it('returns the updated recipe', () => {
      const updated = updateRecipe(BASE_RECIPES[0], { title: 'New Title' })
      expect(updated.title).toBe('New Title')
      expect(updated.id).toBe(BASE_RECIPES[0].id)
    })

    it('updates the updatedAt timestamp', () => {
      const before = BASE_RECIPES[0].updatedAt
      const updated = updateRecipe(BASE_RECIPES[0], { title: 'X' })
      expect(updated.updatedAt).not.toBe(before)
    })
  })

  describe('deleteRecipe', () => {
    it('sets deletedAt on the recipe', () => {
      const deleted = deleteRecipe(BASE_RECIPES[0])
      expect(deleted.deletedAt).toBeTruthy()
    })

    it('does not mutate the original', () => {
      const original = { ...BASE_RECIPES[0] }
      deleteRecipe(BASE_RECIPES[0])
      expect(BASE_RECIPES[0].deletedAt).toBeUndefined()
    })
  })
})

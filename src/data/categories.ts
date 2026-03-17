import type { FoodCategory } from '@/src/types'

/**
 * Maps normalized ingredient name fragments to FoodCategory.
 * Uses substring matching (check if ingredient name includes the key).
 */
export const INGREDIENT_CATEGORY_MAP: Record<string, FoodCategory> = {
  // Vegetables & Fruits
  tomato: 'vegetables_fruits',
  cucumber: 'vegetables_fruits',
  carrot: 'vegetables_fruits',
  broccoli: 'vegetables_fruits',
  spinach: 'vegetables_fruits',
  lettuce: 'vegetables_fruits',
  onion: 'vegetables_fruits',
  garlic: 'vegetables_fruits',
  ginger: 'vegetables_fruits',
  celery: 'vegetables_fruits',
  zucchini: 'vegetables_fruits',
  'bell pepper': 'vegetables_fruits',
  'sweet potato': 'vegetables_fruits',
  avocado: 'vegetables_fruits',
  banana: 'vegetables_fruits',
  blueberr: 'vegetables_fruits',
  kiwi: 'vegetables_fruits',
  mango: 'vegetables_fruits',
  lemon: 'vegetables_fruits',
  basil: 'vegetables_fruits',
  mushroom: 'vegetables_fruits',
  'cherry tomato': 'vegetables_fruits',
  'red onion': 'vegetables_fruits',
  'fresh basil': 'vegetables_fruits',
  pea: 'vegetables_fruits',
  'romaine lettuce': 'vegetables_fruits',

  // Meat & Fish
  chicken: 'meat_fish',
  beef: 'meat_fish',
  salmon: 'meat_fish',
  tuna: 'meat_fish',
  pork: 'meat_fish',
  shrimp: 'meat_fish',
  ground: 'meat_fish',

  // Dairy & Eggs
  egg: 'dairy_eggs',
  milk: 'dairy_eggs',
  butter: 'dairy_eggs',
  cheese: 'dairy_eggs',
  parmesan: 'dairy_eggs',
  cheddar: 'dairy_eggs',
  feta: 'dairy_eggs',
  'sour cream': 'dairy_eggs',
  'almond milk': 'dairy_eggs',
  'coconut milk': 'dairy_eggs',

  // Grains & Bread
  spaghetti: 'grains_bread',
  pasta: 'grains_bread',
  rice: 'grains_bread',
  oats: 'grains_bread',
  bread: 'grains_bread',
  flour: 'grains_bread',
  quinoa: 'grains_bread',
  lentil: 'grains_bread',
  chickpea: 'grains_bread',
  tortilla: 'grains_bread',
  'taco shell': 'grains_bread',
  'arborio rice': 'grains_bread',
  'cooked rice': 'grains_bread',
  crouton: 'grains_bread',
  granola: 'grains_bread',
  'rolled oats': 'grains_bread',

  // Spices & Seasonings
  cumin: 'spices_seasonings',
  turmeric: 'spices_seasonings',
  'curry powder': 'spices_seasonings',
  cinnamon: 'spices_seasonings',
  oregano: 'spices_seasonings',
  'chili flake': 'spices_seasonings',
  'baking powder': 'spices_seasonings',
  sugar: 'spices_seasonings',
  salt: 'spices_seasonings',
  pepper: 'spices_seasonings',
  soy: 'spices_seasonings',
  'sesame oil': 'spices_seasonings',
  'olive oil': 'spices_seasonings',
  tahini: 'spices_seasonings',
  mayonnaise: 'spices_seasonings',
  'caesar dressing': 'spices_seasonings',
  'maple syrup': 'spices_seasonings',
  honey: 'spices_seasonings',
  'lemon juice': 'spices_seasonings',
  'white wine': 'spices_seasonings',
  'vegetable stock': 'spices_seasonings',
  vinegar: 'spices_seasonings',
  olives: 'spices_seasonings',
  'coconut flakes': 'spices_seasonings',
  'chia seeds': 'spices_seasonings',
}

/**
 * Classify a normalized ingredient name into a FoodCategory.
 * Checks if the ingredient name includes any registered fragment.
 */
export function classifyIngredient(normalizedName: string): FoodCategory {
  const lower = normalizedName.toLowerCase()
  for (const [fragment, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (lower.includes(fragment)) return category
  }
  return 'other'
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  vegetables_fruits: 'Vegetables & Fruits',
  meat_fish: 'Meat & Fish',
  dairy_eggs: 'Dairy & Eggs',
  grains_bread: 'Grains & Bread',
  spices_seasonings: 'Spices & Seasonings',
  other: 'Other',
}

export const FOOD_CATEGORY_ORDER: FoodCategory[] = [
  'vegetables_fruits',
  'meat_fish',
  'dairy_eggs',
  'grains_bread',
  'spices_seasonings',
  'other',
]

# Data Model: Recipe Planner Web Application

**Branch**: `001-recipe-planner-app` | **Date**: 2026-03-11  
**Source**: `src/types/index.ts` — all interfaces live here as the single type definition file.

---

## Entities

### 1. `Tag`

Enumerated dietary/meal-type tag. Fixed vocabulary (no custom tags in v1).

```ts
type Tag =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'healthy'
  | 'vegan'
  | 'vegetarian';
```

---

### 2. `IngredientLine`

One ingredient entry within a recipe. Stored as a sub-object of `Recipe`.

```ts
interface IngredientLine {
  id: string;           // UUID — stable identity within a recipe
  name: string;         // Normalized at write-time (trimmed, lowercased)
  quantity: number;     // Positive float; display formatted to ≤2 decimal places
  unit: string;         // e.g. "g", "ml", "pcs", "tbsp", "cup" — free text, lowercase
}
```

**Validation rules**:
- `name`: non-empty after normalization
- `quantity`: > 0
- `unit`: non-empty, lowercase

---

### 3. `PreparationStep`

One ordered step in a recipe.

```ts
interface PreparationStep {
  order: number;        // 1-based integer; determines display order
  description: string;  // Non-empty
}
```

---

### 4. `Recipe`

Core entity. Owned exclusively by the Recipe Manager module.

```ts
interface Recipe {
  id: string;                    // UUID
  title: string;                 // Non-empty; max 100 chars
  photoUrl?: string;             // Optional; absolute URL or relative public path
  cookTimeMinutes: number;       // Positive integer; display as "X min" or "X hr Y min"
  servings: number;              // Positive integer
  tags: Tag[];                   // At least one tag
  ingredients: IngredientLine[]; // At least one entry
  steps: PreparationStep[];      // At least one step; ordered by step.order
  createdAt: string;             // ISO 8601 datetime string
  updatedAt: string;             // ISO 8601 datetime string
  deletedAt?: string;            // ISO 8601 datetime string; present = soft-deleted
}
```

**Validation rules**:
- `title`: non-empty, ≤100 chars
- `cookTimeMinutes`: integer ≥ 1
- `servings`: integer ≥ 1
- `ingredients`: length ≥ 1 (FR-001)
- `steps`: length ≥ 1 (FR-001)
- `tags`: length ≥ 1

**State transitions**:
```
Active ──(soft-delete)──→ Deleted
Deleted ──(restore)──────→ Active   [future; out of scope v1]
```

---

### 5. `DayOfWeek`

```ts
type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';
```

---

### 6. `MealType`

```ts
type MealType = 'breakfast' | 'lunch' | 'dinner';
```

---

### 7. `MealSlot`

One cell in the weekly meal plan grid. Owned exclusively by the Meal Planner module.

```ts
interface MealSlot {
  day: DayOfWeek;
  meal: MealType;
  recipeId: string | null;  // null = empty slot; string = Recipe.id reference
}
```

**Rules**:
- The combination `(day, meal)` is unique within a `MealPlan`.
- A `recipeId` pointing to a soft-deleted recipe transitions the slot to an `orphan` display state (recipe removed warning), but the `recipeId` value is NOT nulled automatically — user must manually clear or replace it.

---

### 8. `MealPlan`

One week's plan for the current user. Owned by the Meal Planner module.

```ts
interface MealPlan {
  isoWeek: string;       // Format: "YYYY-WNN", e.g. "2026-W11"
  slots: MealSlot[];     // Maximum 21 entries (7 days × 3 meals); sparse — empty slots omitted
  updatedAt: string;     // ISO 8601 datetime string
}
```

**Rules**:
- `isoWeek` is the primary key; one `MealPlan` per week.
- Weeks start on Monday (ISO 8601).
- `slots` is sparse: a slot for `(monday, dinner)` does not need to be in the array if empty — omitting is equivalent to `recipeId: null`.

---

### 9. `FoodCategory`

```ts
type FoodCategory =
  | 'vegetables_fruits'
  | 'meat_fish'
  | 'dairy_eggs'
  | 'grains_bread'
  | 'spices_seasonings'
  | 'other';
```

Display labels (used in UI, stored in `src/data/categories.ts`):
| Value | Display |
|-------|---------|
| `vegetables_fruits` | Vegetables & Fruits |
| `meat_fish` | Meat & Fish |
| `dairy_eggs` | Dairy & Eggs |
| `grains_bread` | Grains & Bread |
| `spices_seasonings` | Spices & Seasonings |
| `other` | Other |

---

### 10. `GroceryItem`

One row on the grocery shopping list. Owned by the Grocery List Generator module.

```ts
interface GroceryItem {
  id: string;                // UUID
  name: string;              // Normalized ingredient name
  quantity: number;          // Aggregated quantity (sum across recipes)
  unit: string;              // Unit of measure
  category: FoodCategory;
  checked: boolean;          // true = purchased
  isManual: boolean;         // true = user-added; false = derived from meal plan
  displayOrder: number;      // Within-category sort order; manual items appended last
}
```

---

### 11. `GroceryList`

The shopping list for a given week's meal plan.

```ts
interface GroceryList {
  isoWeek: string;           // Same key as MealPlan.isoWeek
  items: GroceryItem[];
  generatedAt: string;       // ISO 8601; timestamp of last auto-generation
  updatedAt: string;         // ISO 8601; timestamp of last manual edit
}
```

---

## Relationships

```
Recipe  1 ──── * IngredientLine    (composition — ingredient belongs to exactly one recipe)
Recipe  1 ──── * PreparationStep   (composition)
MealPlan 1 ─── * MealSlot          (composition — slot belongs to one plan)
MealSlot * ─── 0..1 Recipe         (reference by recipeId — nullable foreign key)
MealPlan 1 ─── 0..1 GroceryList    (derived; keyed by isoWeek)
GroceryList 1 ─ * GroceryItem      (composition)
```

---

## Mock Data Shape (Seed)

`src/data/recipes.ts` exports `SEED_RECIPES: Recipe[]` with ~20 pre-built recipes.
Example entry:

```ts
{
  id: 'r-001',
  title: 'Tomato Basil Pasta',
  photoUrl: '/images/recipes/tomato-basil-pasta.jpg',
  cookTimeMinutes: 25,
  servings: 2,
  tags: ['dinner', 'vegetarian'],
  ingredients: [
    { id: 'i-r001-1', name: 'spaghetti', quantity: 200, unit: 'g' },
    { id: 'i-r001-2', name: 'tomato', quantity: 3, unit: 'pcs' },
    { id: 'i-r001-3', name: 'fresh basil', quantity: 10, unit: 'g' },
    { id: 'i-r001-4', name: 'olive oil', quantity: 2, unit: 'tbsp' },
    { id: 'i-r001-5', name: 'garlic', quantity: 2, unit: 'cloves' },
  ],
  steps: [
    { order: 1, description: 'Boil spaghetti in salted water until al dente.' },
    { order: 2, description: 'Sauté garlic in olive oil, add chopped tomatoes, simmer 10 min.' },
    { order: 3, description: 'Toss pasta with sauce, top with fresh basil.' },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}
```

---

## Ingredient Normalization Rules

Applied in `src/lib/ingredientUtils.ts`:

1. `name.trim().toLowerCase().replace(/\s+/g, ' ')`
2. `unit.trim().toLowerCase()`
3. Unit canonicalization: `'kilogram' | 'kg' → 'kg'`, `'gram' | 'gr' → 'g'`
4. Aggregation key: `${normalizedName}::${canonicalUnit}`

---

## localStorage Schema

| Key | Type | Notes |
|-----|------|-------|
| `rp:recipes` | `Recipe[]` | Starts from `SEED_RECIPES`; includes user edits |
| `rp:meal-plan:${isoWeek}` | `MealPlan` | One entry per week ever visited |
| `rp:grocery:${isoWeek}` | `GroceryList` | Regenerated on demand, manual edits preserved |

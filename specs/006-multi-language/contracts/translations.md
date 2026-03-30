# Contract: Translation Keys (006-multi-language)

**Branch**: `006-multi-language`  
**Type**: Internal key naming convention  
**Consumers**: All components/pages using `useTranslations()` from next-intl

---

## Overview

This contract defines the authoritative structure and naming rules for all translation keys in `messages/vi.json` and `messages/en.json`. Both files MUST have identical key structures. Values differ by locale; keys never differ.

---

## Key Naming Rules

1. **camelCase** for all key names at every nesting level.
2. **Max 3 levels of nesting** (e.g., `namespace.group.key`). Deeper nesting is not permitted.
3. **Namespace = domain** — one namespace per application module (not per component).
4. **No pluralization suffixes in key names** — use ICU message syntax for plurals within the value.
5. **No locale codes in key names** — the locale is determined by which file is loaded.
6. **Keys for dynamic strings use ICU parameters in curly braces**: `{count}`, `{n}`, `{filled}`, `{total}`.

---

## Namespace Registry

| Namespace | Used in | `useTranslations()` call |
|-----------|---------|--------------------------|
| `auth` | Auth layout, Login page, Signup page | `useTranslations('auth')` |
| `nav` | Sidebar, LogoutButton, LanguageSwitcher | `useTranslations('nav')` |
| `dashboard` | Dashboard page, WeekAtAGlance, RecentRecipes | `useTranslations('dashboard')` |
| `recipes` | Recipes page, RecipeDetail, RecipeForm, RecipeFilters, RecipeSearch, ImageUploadInput, RecipePicker, Recipe [id] page | `useTranslations('recipes')` |
| `mealPlanner` | Meal Planner page, MealGrid, WeekNavigator | `useTranslations('mealPlanner')` |
| `groceryList` | Grocery List page, AddManualItemForm | `useTranslations('groceryList')` |
| `categories` | GroceryCategory, AddManualItemForm (select options) | `useTranslations('categories')` |
| `notFound` | not-found.tsx (404 page) | `useTranslations('notFound')` |
| `common` | Root layout (skip-to-content) | `useTranslations('common')` |

---

## Complete Key Reference

### `auth`

```
auth.layout.tagline
auth.login.title
auth.login.emailLabel
auth.login.passwordLabel
auth.login.submit
auth.login.submitting
auth.login.noAccount
auth.login.signUp
auth.login.placeholder.email
auth.login.error.required
auth.login.error.failed
auth.signup.title
auth.signup.passwordHint
auth.signup.submit
auth.signup.submitting
auth.signup.hasAccount
auth.signup.signIn
auth.signup.error.emailRequired
auth.signup.error.emailInvalid
auth.signup.error.passwordTooShort
auth.signup.error.failed
```

### `nav`

```
nav.dashboard
nav.recipes
nav.mealPlanner
nav.groceryList
nav.signOut
nav.brand
nav.language.vi
nav.language.en
```

### `dashboard`

```
dashboard.title
dashboard.subtitle
dashboard.stats.totalRecipes
dashboard.stats.mealsPlanned
dashboard.stats.groceryItemsLeft
dashboard.weekAtAGlance.title
dashboard.weekAtAGlance.manage
dashboard.weekAtAGlance.mealsPlanned     ← ICU: {count}
dashboard.weekAtAGlance.slotsEmpty       ← ICU: {count}
dashboard.weekAtAGlance.noMeals
dashboard.weekAtAGlance.emptyWeek
dashboard.weekAtAGlance.planMeals
dashboard.recentRecipes.title
dashboard.recentRecipes.viewAll
dashboard.recentRecipes.empty
```

### `recipes`

```
recipes.title
recipes.inYourCollection
recipes.found
recipes.newRecipe
recipes.empty.noFilters
recipes.empty.withFilters
recipes.search.placeholder
recipes.search.ariaLabel
recipes.filter.clear
recipes.filter.ariaLabel
recipes.detail.notFound
recipes.detail.notFoundSub
recipes.detail.backToRecipes
recipes.detail.edit
recipes.detail.delete
recipes.detail.ingredients
recipes.detail.instructions
recipes.detail.servings              ← ICU: {n}
recipes.detail.min                   ← ICU: {n}
recipes.form.titleLabel
recipes.form.titlePlaceholder
recipes.form.cookTimeLabel
recipes.form.servingsLabel
recipes.form.tagsLabel
recipes.form.ingredientsLabel
recipes.form.stepsLabel
recipes.form.photoLabel
recipes.form.photoHint
recipes.form.namePlaceholder
recipes.form.qtyPlaceholder
recipes.form.unitPlaceholder
recipes.form.addIngredient
recipes.form.addStep
recipes.form.clickToUpload
recipes.form.saving
recipes.form.cancel
recipes.form.errors.titleRequired
recipes.form.errors.cookTimeInvalid
recipes.form.errors.servingsInvalid
recipes.form.errors.tagsRequired
recipes.form.errors.ingredientsRequired
recipes.form.errors.stepsRequired
recipes.picker.chooseRecipe
recipes.picker.noFound
recipes.picker.servings              ← ICU: {n}
recipes.picker.searchAriaLabel
recipes.picker.closeAriaLabel
```

### `mealPlanner`

```
mealPlanner.title
mealPlanner.subtitle                 ← ICU: {filled}, {total}
mealPlanner.clearWeek
mealPlanner.clearConfirm
mealPlanner.empty.title
mealPlanner.empty.subtitle
mealPlanner.days.mon
mealPlanner.days.tue
mealPlanner.days.wed
mealPlanner.days.thu
mealPlanner.days.fri
mealPlanner.days.sat
mealPlanner.days.sun
mealPlanner.meals.breakfast
mealPlanner.meals.lunch
mealPlanner.meals.dinner
mealPlanner.weekNav.thisWeek
```

### `groceryList`

```
groceryList.title
groceryList.remaining                ← ICU: {n}
groceryList.remainingOne
groceryList.generate
groceryList.regenerate
groceryList.planMealsFirst
groceryList.empty.noMeals.title
groceryList.empty.noMeals.subtitle
groceryList.empty.noMeals.goToPlanner
groceryList.empty.noItems
groceryList.addManual.trigger
groceryList.addManual.title
groceryList.addManual.itemName
groceryList.addManual.qty
groceryList.addManual.unit
groceryList.addManual.add
groceryList.addManual.cancel
```

### `categories`

```
categories.vegetables_fruits
categories.meat_fish
categories.dairy_eggs
categories.grains_bread
categories.spices_seasonings
categories.other
```

*Note*: Key names match the `FoodCategory` TypeScript union values exactly. Components that previously used `FOOD_CATEGORY_LABELS[category]` will switch to `t(category)` with the `categories` namespace.

### `notFound`

```
notFound.title
notFound.description
notFound.goHome
notFound.browseRecipes
```

### `common`

```
common.skipToContent
```

---

## ICU Message Parameters

| Key | Parameters | Example value (en) |
|-----|------------|-------------------|
| `dashboard.weekAtAGlance.mealsPlanned` | `{count}` | `"{count} meals planned"` |
| `dashboard.weekAtAGlance.slotsEmpty` | `{count}` | `"{count} slots empty"` |
| `recipes.detail.servings` | `{n}` | `"{n} servings"` |
| `recipes.detail.min` | `{n}` | `"{n} min"` |
| `recipes.picker.servings` | `{n}` | `"{n} servings"` |
| `mealPlanner.subtitle` | `{filled}`, `{total}` | `"{filled} of {total} slots filled"` |
| `groceryList.remaining` | `{n}` | `"{n} items remaining"` |

Usage: `t('subtitle', { filled: 3, total: 21 })` — standard next-intl ICU syntax.

---

## Fallback Rules

1. If a key exists in `vi.json` but is **missing** from `en.json`, next-intl falls back to the `vi.json` value. (FR-008)
2. If a key is **missing from both** bundles, next-intl renders the raw key path as a string. This MUST NOT happen in production — all keys must be present in `vi.json`.
3. Missing keys in `en.json` are acceptable during development but MUST be filled before the feature is merged.

---

## Validation

- A CI script (or manual check) SHOULD verify that `en.json` has no keys present in `vi.json` that are absent in `en.json`, to catch accidental regressions.
- TypeScript type safety via next-intl's `createTranslator` is available for compile-time key validation if needed in a future iteration.

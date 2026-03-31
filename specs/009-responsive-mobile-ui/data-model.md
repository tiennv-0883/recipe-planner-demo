# Data Model: 009-responsive-mobile-ui

**Branch**: `009-responsive-mobile-ui`  
**Date**: 2026-03-31  
**Note**: This is a UI-layout-only feature. No database schema, Supabase tables, or type
definitions change. The "data model" here documents component interface shapes that are
added or modified.

---

## New: `NavItem` (shared UI shape)

Both `Sidebar.tsx` and the new `BottomNav.tsx` share the same nav-item shape.
Currently, this interface is defined inline in `Sidebar.tsx`. It will remain co-located
(no shared file needed — each component defines it locally) but the shape must match.

```typescript
interface NavItem {
  href: string       // Exact route path (e.g. '/', '/recipes')
  labelKey: string   // next-intl translation key under 'nav' namespace
  icon: React.ReactNode
}
```

The five nav items and their order are the source of truth:

| Order | href | labelKey | Notes |
|---|---|---|---|
| 1 | `/` | `dashboard` | Active only on exact `/` match |
| 2 | `/recipes` | `recipes` | Active on `/recipes` prefix |
| 3 | `/meal-planner` | `mealPlanner` | Active on `/meal-planner` prefix |
| 4 | `/grocery-list` | `groceryList` | Active on `/grocery-list` prefix |
| 5 | `/ingredient-catalog` | `ingredientCatalog` | Active on `/ingredient-catalog` prefix |

Logout / account: rendered separately (not in the `NAV_ITEMS` array) as a footer element
in `Sidebar.tsx` on desktop. On mobile (`BottomNav.tsx`) an account icon button is
rendered at the far right, opening a small overlay with the `LogoutButton` component.

---

## Modified: `BottomNav` Component Props

```typescript
// src/components/layout/BottomNav.tsx
// No props — reads pathname from usePathname(), translations from useTranslations('nav')
export default function BottomNav(): JSX.Element
```

Internal state:
- `accountOpen: boolean` — controls the account overlay visibility (for logout access on
  mobile). Derived from `useState(false)`.

---

## Modified: `MainLayout` Component Props

No props added. The change is internal — the layout div gains responsive Tailwind classes.

```typescript
// Before (current):
<div className="pl-60">
  <main className="min-h-screen px-6 py-8" id="main-content">

// After (responsive):
<div className="sm:pl-60">
  <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 pb-24 sm:pb-8" id="main-content">
```

`pb-24` on mobile ensures content is not obscured by the 64px bottom nav + safe area.

---

## Modified: `MealGrid` — Mobile Day Card Shape (UI only)

No new types. The existing `MealPlan`, `MealSlot`, `DayOfWeek`, and `MealType` types are
reused unchanged. The mobile view iterates `DAYS` (same array) and renders a different DOM
structure.

Mobile day card structure (conceptual):

```
DayCard
  └── header: day name  (t('mealPlanner.days.{day}'))
  └── MealRow × 3
        ├── label: meal type name (Breakfast / Lunch / Dinner)
        └── SlotContent (same slot logic as desktop cell)
```

---

## Unchanged Entities

All of the following are confirmed unchanged by this feature:

| Entity | Location | Change |
|---|---|---|
| `Recipe` | `src/types/index.ts` | None |
| `MealPlan`, `MealSlot` | `src/types/index.ts` | None |
| `GroceryList`, `GroceryItem` | `src/types/index.ts` | None |
| `CatalogEntry` | `src/types/index.ts` | None |
| Supabase schema | `supabase/migrations/` | None |
| All service functions | `src/services/` | None |
| All context/reducers | `src/context/` | None |

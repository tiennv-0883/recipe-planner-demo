# Quickstart: 009-responsive-mobile-ui

**Branch**: `009-responsive-mobile-ui`  
**Prereqs**: Node ≥18, `npm install` done, Supabase env vars set (`.env.local`).

---

## Test the feature

```bash
# Run Playwright e2e tests (mobile viewport suite)
npx playwright test tests/e2e/responsive-mobile.spec.ts

# Run all tests
npx playwright test

# Open Playwright UI to visually debug at 375px
npx playwright test --ui
```

---

## Preview on mobile viewport

```bash
npm run dev
# Open http://localhost:3000 in Chrome DevTools → Device Toolbar → 375px width
# Or use Playwright codegen for interactive inspection:
npx playwright codegen --viewport-size=375,812 http://localhost:3000
```

---

## Implementation sequence

Follow this order when implementing tasks. Each step is independently testable.

### Step 1 — Write Playwright tests (TDD gate, Principle III)

Create `tests/e2e/responsive-mobile.spec.ts` covering all 5 user stories:

```typescript
// US1: Bottom nav visible, sidebar hidden at 375px
// US2: Recipe cards 1-col on mobile, 2-col at 768px
// US3: Meal planner days stack vertically on mobile
// US4: Grocery/catalog items meet 44px tap targets
// US5: Auth buttons ≥44px height, forms full-width
```

Run once — all tests fail (red state). Proceed only after tests are committed.

### Step 2 — BottomNav component (FR-001, FR-003, FR-004)

Create `src/components/layout/BottomNav.tsx`:
- 5 nav tabs + 1 account tab
- `flex sm:hidden fixed bottom-0 inset-x-0 z-30`
- Tab height `min-h-[56px]`
- Safe area: `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}`
- Active state via `usePathname()`
- ARIA: `role="navigation"`, `aria-current="page"` on active

### Step 3 — Update MainLayout (FR-002, FR-013, FR-015)

Edit `src/components/layout/MainLayout.tsx`:
- Add `<BottomNav />` import and render
- Content wrapper: `pl-0 sm:pl-60`
- Main: `px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8`

### Step 4 — Hide Sidebar on mobile (FR-002)

Edit `src/components/layout/Sidebar.tsx`:
- Change `<aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col ...">` 
  → `<aside className="hidden sm:flex fixed inset-y-0 left-0 z-30 w-60 flex-col ...">`

### Step 5 — Add safe area meta tag (safe area support)

Edit `src/app/layout.tsx`:
- Add to `<head>` via `metadata`:
  ```typescript
  export const metadata: Metadata = {
    ...
    viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  }
  ```

### Step 6 — Fix MealGrid mobile layout (FR-009)

Edit `src/components/meal-planner/MealGrid.tsx`:
- Wrap existing `<div className="overflow-x-auto">` table in `<div className="hidden sm:block">`.
- Add a `<div className="sm:hidden space-y-3">` block above it that renders one card per day, each containing a vertical list of the 3 meal rows.
- Both views use the same `plan`, `recipesById`, `onAddRecipe`, `onRemoveRecipe` props.

### Step 7 — Fix RecipeGrid columns (FR-007)

Edit `src/components/recipes/RecipeGrid.tsx`:
- Change `sm:grid-cols-2` → `md:grid-cols-2` on the grid container.

### Step 8 — Fix RecipeDetail header on mobile

Edit `src/components/recipes/RecipeDetail.tsx`:
- Change `flex items-start justify-between gap-4` on header → `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`

### Step 9 — Fix tap targets in Grocery, Catalog, WeekNavigator

- `GroceryCategory.tsx`: Checkbox label `min-h-[44px]`; remove button `p-2.5 -m-2.5`
- `CatalogCard.tsx`: Edit/Delete buttons `min-h-[44px]`
- `WeekNavigator.tsx`: Prev/Next `p-3` (was `p-2`)
- `AddManualItemForm.tsx`: Toggle trigger `min-h-[44px] flex items-center`

### Step 10 — Fix Auth layout and buttons

- `src/app/(auth)/layout.tsx`: Change `p-8` → `p-6 sm:p-8` on the card div
- `src/app/(auth)/login/page.tsx`: Submit button `py-2.5` → `py-3`
- `src/app/(auth)/signup/page.tsx`: Submit button `py-2.5` → `py-3`

---

## Acceptance checklist (quick)

```
[ ] At 375px: no horizontal scroll on any page
[ ] At 375px: Sidebar hidden, BottomNav visible and fixed
[ ] At 375px: Tap all 5 bottom nav tabs → correct page navigation
[ ] At 375px: Meal Planner shows stacked day cards (not table)
[ ] At 375px: Recipe cards are single-column
[ ] At 1024px: Sidebar visible, BottomNav hidden
[ ] At 1024px: Meal Planner shows the original table layout
[ ] All interactive elements ≥44px tap target (check in DevTools)
```

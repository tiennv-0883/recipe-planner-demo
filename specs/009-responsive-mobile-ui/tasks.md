# Tasks: Responsive Mobile UI

**Input**: Design documents from `/specs/009-responsive-mobile-ui/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/navigation.md ✅ · quickstart.md ✅

**Tests**: None — layout/UI-only feature; no business logic introduced. See plan.md §Complexity Tracking for TDD mitigation rationale.

**Organization**: Tasks grouped by user story. Each story touches fully independent files and can be implemented and verified in parallel after Phase 1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete-task dependencies)
- **[Story]**: User story label (US1–US5)
- File paths are workspace-relative from repo root

---

## Phase 1: Setup

**Purpose**: Root-level meta tag change that enables safe-area CSS variables for the app shell. Apply first — takes 30 seconds and unblocks BottomNav safe-area behaviour.

- [X] T001 Add `viewport-fit=cover` to the viewport metadata export in `src/app/layout.tsx`

**Checkpoint**: `viewport-fit=cover` is live — `env(safe-area-inset-bottom)` will resolve correctly on iOS.

---

## Phase 3: User Story 1 — Navigate the App on a Mobile Phone (Priority: P1) 🎯 MVP

**Goal**: Replace the sidebar with a fixed bottom navigation bar on screens < 640px. All 5 destinations remain accessible on mobile; sidebar remains intact on ≥640px.

**Independent Test**: Open the app in a browser at 375px viewport width. Verify: sidebar is hidden (`display:none`), bottom nav is visible and fixed at the bottom, all 5 nav icons navigate to the correct page, tap targets are ≥56px, active tab is highlighted. At ≥1024px: sidebar is visible, bottom nav is hidden.

- [X] T002 [US1] Create `BottomNav` component with 5 nav tabs + account overlay in `src/components/layout/BottomNav.tsx`  
  — `flex sm:hidden fixed bottom-0 inset-x-0 z-30`; tabs `flex-1 flex-col items-center py-2 min-h-[56px]`; active state via `usePathname()`; account tab opens inline overlay with `LogoutButton`; safe area: `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}`; ARIA: `<nav aria-label="Mobile navigation">`, `aria-current="page"` on active link; labels via `useTranslations('nav')` reusing existing `nav.*` keys

- [X] T003 [US1] Import `BottomNav` and apply responsive classes in `src/components/layout/MainLayout.tsx`  
  — render `<BottomNav />` after `<Sidebar />`; change content wrapper from `pl-60` → `sm:pl-60`; change main from `px-6 py-8` → `px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8` (depends on T002)

- [X] T004 [P] [US1] Hide sidebar on mobile in `src/components/layout/Sidebar.tsx`  
  — add `hidden sm:flex` to the `<aside>` root element (replacing the standalone `flex` that is currently there)

**Checkpoint**: US1 fully functional — bottom nav visible on mobile, sidebar visible on desktop, all 5 tabs navigate correctly.

---

## Phase 4: User Story 2 — Browse and Search Recipes on Mobile (Priority: P2)

**Goal**: Recipe list shows a single-column card layout on mobile and a 2-column grid from 768px. Recipe detail page uses a single-column, vertically stacked layout on mobile.

**Independent Test**: At 375px, load `/recipes` — cards fill full width in 1 column, no horizontal overflow. Tap a card → Recipe Detail page opens; all sections (image, title, ingredients, steps) visible in a single column. At 768px, cards switch to 2-column grid.

- [X] T005 [P] [US2] Change grid breakpoint from `sm:grid-cols-2` to `md:grid-cols-2` in `src/components/recipes/RecipeGrid.tsx`  
  — aligns with FR-007 (2-column at ≥768px); single-column base is retained

- [X] T006 [P] [US2] Stack header action buttons vertically on mobile in `src/components/recipes/RecipeDetail.tsx`  
  — change header container from `flex items-start justify-between gap-4` → `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`

**Checkpoint**: US2 fully functional — recipe list and detail render correctly at both mobile and tablet/desktop breakpoints.

---

## Phase 5: User Story 3 — Use the Meal Planner on Mobile (Priority: P3)

**Goal**: The Meal Planner weekly grid presents as a vertically stacked day-by-day card list on mobile instead of a wide multi-column table. Desktop table layout is preserved unchanged.

**Independent Test**: At 375px, load `/meal-planner` — all 7 days visible as stacked cards (no horizontal scroll); each card shows day name + 3 meal type rows; add/remove interactions work. At ≥640px, original multi-column table is shown.

- [X] T007 [US3] Add CSS-only mobile stacked day card view to `src/components/meal-planner/MealGrid.tsx`  
  — wrap the existing `<div className="overflow-x-auto">` table in `<div className="hidden sm:block">`; add a `<div className="sm:hidden space-y-3">` sibling above it that renders one card per day (day name heading + 3 meal-type rows: Breakfast / Lunch / Dinner) reusing the same `plan`, `recipesById`, `onAddRecipe`, `onRemoveRecipe` props — no JS media query, no new state

- [X] T008 [P] [US3] Increase WeekNavigator prev/next button padding in `src/components/meal-planner/WeekNavigator.tsx`  
  — change `p-2` → `p-3` on both arrow buttons (results in 48px tap target, meets FR-005)

**Checkpoint**: US3 fully functional — stacked day layout at mobile, table layout at desktop, week navigation buttons are touch-accessible.

---

## Phase 6: User Story 4 — Manage Grocery List and Ingredient Catalog on Mobile (Priority: P4)

**Goal**: Grocery list and ingredient catalog render in a full-width single-column layout on mobile. All action controls (checkbox, remove, edit, delete, add-item toggle) meet the 44px minimum tap target requirement.

**Independent Test**: At 375px, load `/grocery-list` — items fill full width; tap target of checkbox and remove button is ≥44px. Load `/ingredient-catalog` — single-column entries; edit and delete buttons are ≥44px. Add-item toggle button is ≥44px.

- [X] T009 [P] [US4] Fix grocery item tap targets in `src/components/grocery/GroceryCategory.tsx`  
  — checkbox `<label>`: add `min-h-[44px] flex items-center` to ensure 44px touch height; remove button (`w-4 h-4` icon): add `p-2.5 -m-2.5` to expand hit area without changing visual size

- [X] T010 [P] [US4] Fix add-item toggle button tap target in `src/components/grocery/AddManualItemForm.tsx`  
  — add `min-h-[44px] flex items-center` to the toggle trigger button element

- [X] T011 [P] [US4] Fix catalog card edit/delete button tap targets in `src/components/catalog/CatalogCard.tsx`  
  — add `min-h-[44px] px-3` to both the Edit and Delete buttons

**Checkpoint**: US4 fully functional — grocery and catalog pages are single-column on mobile with all controls meeting the 44px touch target requirement.

---

## Phase 7: User Story 5 — Log In and Register on Mobile (Priority: P5)

**Goal**: Login and registration pages display full-width, single-column forms with touch-accessible submit buttons (minimum 44px height) on mobile.

**Independent Test**: At 375px, load `/login` and `/signup` — forms fill full width in a single column; submit buttons are full-width with `min-height ≥44px`; no content overflows the viewport; input fields and labels don't overlap.

- [X] T012 [P] [US5] Reduce auth card inner padding on mobile in `src/app/(auth)/layout.tsx`  
  — change the card `padding` from `p-8` → `p-6 sm:p-8` (24px mobile, 32px tablet/desktop)

- [X] T013 [P] [US5] Increase login submit button height in `src/app/(auth)/login/page.tsx`  
  — change submit button `py-2.5` → `py-3` (resulting in ≈48px height, exceeds 44px minimum)

- [X] T014 [P] [US5] Increase signup submit button height in `src/app/(auth)/signup/page.tsx`  
  — change submit button `py-2.5` → `py-3` (resulting in ≈48px height, exceeds 44px minimum)

**Checkpoint**: US5 fully functional — auth forms are usable on mobile with properly-sized touch controls.

---

## Dependencies

Story execution order (recommended, not required — all post-Phase-1 stories are file-independent):

```
T001 (Setup)
  └── T002 → T003 → T004   (US1 — must be sequential: BottomNav before MainLayout)
  └── T005, T006            (US2 — parallel with each other and with US3–US5)
  └── T007, T008            (US3 — T007 before T008 recommended; both parallel with other stories)
  └── T009, T010, T011      (US4 — all parallel with each other and with other stories)
  └── T012, T013, T014      (US5 — all parallel with each other and with other stories)
```

**Cross-story parallelisation** (after T001): US2, US3, US4, US5 touch entirely different files and can all be implemented simultaneously. US1 must be serialized internally (T002 → T003) but can start in parallel with any other story's beginning.

---

## Parallel Execution Examples

### Fastest path (2 engineers):

**Engineer A**: T001 → T002 → T003 → T004 (US1 complete)  
**Engineer B**: T005 + T006 (US2) → T007 + T008 (US3) → T012 + T013 + T014 (US5)

### Maximum parallelisation (5 engineers after T001):

| Engineer | Tasks |
|---|---|
| A | T002 → T003 → T004 (US1) |
| B | T005, T006 (US2) |
| C | T007, T008 (US3) |
| D | T009, T010, T011 (US4) |
| E | T012, T013, T014 (US5) |

---

## Implementation Strategy

**MVP scope**: US1 (T001–T004) — delivers the mobile navigation bar. The app is usable on mobile as soon as T004 is done, even before other stories are complete.

**Incremental delivery order**: US1 → US2 → US3 → US4 → US5 — each story adds one more section of the app being fully mobile-friendly.

**All tasks are Tailwind-class-only changes** (except T002 which is a new component and T007 which adds a new JSX block). No new dependencies, no API changes, no schema changes, no state management changes.

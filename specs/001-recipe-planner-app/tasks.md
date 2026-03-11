---
description: "Task list for Recipe Planner Web Application"
---

# Tasks: Recipe Planner Web Application

**Input**: Design documents from `/specs/001-recipe-planner-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/internal-services.md ✅, quickstart.md ✅

**Tests**: Included per research.md decision (Jest + RTL for unit/component, Playwright for e2e).
**Tech stack**: Next.js 15 (App Router, `output: 'export'`) · TypeScript 5 · Tailwind CSS 3 · React Context · localStorage · @dnd-kit

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US5 maps to spec.md user stories
- All paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: Initialise the Next.js static-export project with all tooling in place.

- [X] T001 Initialise Next.js 15 project with TypeScript 5, Tailwind CSS 3, and @dnd-kit/core; add clsx and tailwind-merge dependencies — `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- [X] T002 Configure `next.config.ts` with `output: 'export'`, `trailingSlash: true`, and `images.unoptimized: true` for static export compatibility
- [X] T003 [P] Configure ESLint (Next.js preset) and Prettier with `plugins: [tailwindcss]` — `.eslintrc.json`, `.prettierrc`
- [X] T004 [P] Configure Jest 29 with `next/jest` preset and React Testing Library — `jest.config.ts`, `jest.setup.ts`; add `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [X] T005 [P] Configure Playwright for e2e tests — `playwright.config.ts`; add `tests/e2e/` directory
- [X] T006 [P] Add all npm scripts to `package.json`: `dev`, `build`, `start`, `lint`, `format`, `type-check`, `test`, `test:watch`, `test:e2e`, `test:coverage`
- [X] T007 [P] Create static assets directory and add placeholder recipe images — `public/images/recipes/`

**Checkpoint**: `npm run dev` starts without errors; `npm test` runs (0 tests pass); `npm run build` exits cleanly.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, seed data, utility libraries, localStorage helpers, app shell layout, and
all three Context providers. MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 Define all TypeScript entity interfaces (Recipe, IngredientLine, PreparationStep, MealPlan, MealSlot, GroceryList, GroceryItem, Tag, DayOfWeek, MealType, FoodCategory) per data-model.md — `src/types/index.ts`
- [X] T009 [P] Create seed data: ~20 mock Recipe objects covering all tag types, varied cook times, servings, and photo references — `src/data/recipes.ts`
- [X] T010 [P] Create ingredient-to-FoodCategory mapping dictionary (~80 common ingredients) and re-exports — `src/data/categories.ts`, `src/data/index.ts`
- [X] T011 [P] Implement `localStorage` namespaced read/write/clear helpers with try-catch and JSON serialization — `src/lib/storage.ts`
- [X] T012 [P] Write unit tests for `weekUtils` FIRST (currentIsoWeek, relativeIsoWeek, isoWeekToDateRange) — `tests/unit/lib/weekUtils.test.ts`
- [X] T013 [P] Implement ISO week utility functions after T012 tests fail — `src/lib/weekUtils.ts`
- [X] T014 [P] Write unit tests for `ingredientUtils` FIRST (normalization, unit canonicalization, aggregation by composite key, incompatible-unit separation) — `tests/unit/lib/ingredientUtils.test.ts`
- [X] T015 [P] Implement ingredient normalization and aggregation utilities after T014 tests fail — `src/lib/ingredientUtils.ts`
- [X] T016 Create root `layout.tsx` with `RecipeProvider`, `MealPlanProvider`, `GroceryProvider` wrappers, global Tailwind base styles, and sidebar layout — `src/app/layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/MainLayout.tsx`
- [X] T017 Implement `RecipeContext` with `useReducer` (actions: CREATE, UPDATE, DELETE, HYDRATE) and `localStorage` hydration/persistence on dispatch — `src/context/RecipeContext.tsx`
- [X] T018 [P] Implement `MealPlanContext` with `useReducer` (actions: ASSIGN_SLOT, CLEAR_SLOT, SET_WEEK, HYDRATE) and localStorage persistence keyed by ISO week — `src/context/MealPlanContext.tsx`
- [X] T019 [P] Implement `GroceryContext` with `useReducer` (actions: GENERATE, TOGGLE_ITEM, UPDATE_QUANTITY, ADD_MANUAL, REMOVE_MANUAL, HYDRATE) and localStorage persistence — `src/context/GroceryContext.tsx`

**Checkpoint**: `npm run type-check` passes; `npm test` passes all unit tests for `weekUtils` and `ingredientUtils`; app shell loads at `localhost:3000` with sidebar visible.

---

## Phase 3: User Story 1 — Recipe Management (Priority: P1) 🎯 MVP

**Goal**: Full CRUD for the recipe library. Users can add, view, edit, and soft-delete recipes.
All data persists to localStorage.

**Independent Test**: Create a recipe, reload the page, confirm it appears. Edit an ingredient quantity on an existing recipe, confirm the change is shown. Delete an unassigned recipe, confirm it is removed from the list.

### Implementation for User Story 1

- [X] T020 Write unit tests for `recipes` service (listRecipes, getRecipe, createRecipe validation errors, updateRecipe, deleteRecipe, isRecipeInMealPlan) FIRST — `tests/unit/services/recipes.test.ts`
- [X] T021 Implement `recipes` service after T020 tests fail — `src/services/recipes.ts`
- [X] T022 [P] [US1] Build `RecipeCard` component (photo, title, cook time badge, servings, tag pills, click-to-detail) — `src/components/recipes/RecipeCard.tsx`
- [X] T023 [P] [US1] Build `RecipeForm` component for create/edit with field validation (title required, ≥1 ingredient with quantity + unit, ≥1 step, ≥1 tag, cook time ≥1, servings ≥1); dynamic add/remove ingredient rows and step rows — `src/components/recipes/RecipeForm.tsx`
- [X] T024 [P] [US1] Build `RecipeDetail` component displaying all ingredients (quantity + unit), numbered steps, cook time, servings, tags, and an edit/delete action bar — `src/components/recipes/RecipeDetail.tsx`
- [X] T025 [US1] Build `RecipeList` component rendering a grid of `RecipeCard`s or a compact list view toggle (card/list state stored locally) — `src/components/recipes/RecipeList.tsx`
- [X] T026 [US1] Create Recipes list page: integrates `RecipeList` with "Add Recipe" button and `RecipeForm` modal/drawer — `src/app/recipes/page.tsx`
- [X] T027 [US1] Create Recipe detail page with `generateStaticParams` over seed recipe IDs; renders `RecipeDetail` for the requested ID; shows a "Recipe not found" fallback for IDs only in localStorage — `src/app/recipes/[id]/page.tsx`
- [X] T028 [US1] Wire delete flow: "Delete Recipe" on detail page checks `isRecipeInMealPlan` via `MealPlanContext`; if found, show confirmation modal warning "Recipe is used in your meal plan"; dispatch `DELETE` on confirm — `src/components/recipes/RecipeDetail.tsx`
- [X] T029 [P] [US1] Component test for `RecipeCard` (renders title, cook time, servings, tags; click fires navigation) — `tests/component/RecipeCard.test.tsx`
- [X] T030 [P] [US1] E2e test: create recipe → verify in list → edit ingredient → verify change → delete → verify removed — `tests/e2e/recipe-crud.spec.ts`

**Checkpoint**: US1 fully functional. Navigate to `/recipes`, create a recipe, reload — recipe persists.

---

## Phase 4: User Story 2 — Meal Planning (Priority: P2)

**Goal**: Weekly meal plan grid (Mon–Sun × Breakfast/Lunch/Dinner). Assign recipes to slots
by click-to-pick or drag-and-drop. Navigate between weeks. Each week stored independently.

**Independent Test**: Open Meal Planner, assign a recipe to Monday Breakfast, reload page —
slot still shows that recipe. Drag a different recipe onto the same slot — it replaces the first.
Navigate to next week — previous week plan is unchanged.

### Implementation for User Story 2

- [X] T031 Write unit tests for `mealPlanner` service (getMealPlan empty default, assignRecipe, clearSlot, getFilledSlots, getAssignedRecipeIds, currentIsoWeek, relativeIsoWeek) FIRST — `tests/unit/services/mealPlanner.test.ts`
- [X] T032 Implement `mealPlanner` service after T031 tests fail — `src/services/mealPlanner.ts`
- [X] T033 [P] [US2] Build `RecipePicker` modal/popover: searchable recipe list (title + thumbnail) with click-to-select, wired to `RecipeContext` data — `src/components/meal-planner/RecipePicker.tsx`
- [X] T034 [P] [US2] Build `MealSlot` component: displays assigned recipe thumbnail + title; "×" clear button; acts as `@dnd-kit` drop target; opens `RecipePicker` on click when empty; shows "Recipe removed" placeholder when recipeId is orphaned — `src/components/meal-planner/MealSlot.tsx`
- [X] T035 [US2] Build `WeekGrid` component: 7 columns × 3 rows table; each cell is a `MealSlot`; column headers = day labels with dates; row headers = Breakfast / Lunch / Dinner; wraps in `@dnd-kit` `DndContext` with `useSensor` (PointerSensor + KeyboardSensor) for drag-and-drop — `src/components/meal-planner/WeekGrid.tsx`
- [X] T036 [US2] Create Meal Planner page: renders `WeekGrid`, week navigation controls (← prev / current / next →) updating ISO week state, and a search-and-drag recipe sidebar panel — `src/app/meal-planner/page.tsx`
- [X] T037 [US2] Add "Add to Meal Planner" button on `RecipeDetail` that opens a day/meal-type picker dialog and dispatches `ASSIGN_SLOT` to `MealPlanContext` — `src/components/recipes/RecipeDetail.tsx`
- [X] T038 [P] [US2] Component test for `MealSlot` (renders recipe name when assigned; shows empty state when null; shows orphan warning when recipeId not found in store) — `tests/component/MealSlot.test.tsx`
- [X] T039 [P] [US2] E2e test: assign recipe to slot → reload → verify persisted → drag second recipe onto same slot → verify replaced → clear slot → verify empty → navigate week → verify plan independence — `tests/e2e/meal-planner.spec.ts`

**Checkpoint**: US2 fully functional. Meal plan grid works with click-assign and drag-and-drop; data persists across reloads and weeks are independent.

---

## Phase 5: User Story 3 — Grocery List Generation (Priority: P3)

**Goal**: Auto-aggregate all ingredients from the active meal plan into a categorised checklist.
Users can check off items, edit quantities, add manual items, and refresh the list.

**Independent Test**: Fill ≥3 meal slots with recipes sharing an ingredient (e.g., "tomato").
Navigate to Grocery List — combined tomato quantity appears once. Check an item — reload — still checked. Add a manual item — it appears in "Other". Click "Refresh" — auto-items update, manual item and check states are preserved.

### Implementation for User Story 3

- [X] T040 Write unit tests for `groceryList` service (generateGroceryList aggregation, deduplication, incompatible-unit separation, manual-item preservation, checked-state persistence on regenerate, toggleItem, updateItemQuantity, addManualItem, removeManualItem, groupByCategory, uncheckedCount) FIRST — `tests/unit/services/groceryList.test.ts`
- [X] T041 Implement `groceryList` service after T040 tests fail — `src/services/groceryList.ts`
- [X] T042 [P] [US3] Build `GroceryItem` component: checkbox (checked/unchecked with strikethrough label), editable quantity field (inline edit on click), unit label, remove button (manual items only) — `src/components/grocery-list/GroceryItem.tsx`
- [X] T043 [P] [US3] Build `GroceryGroup` component: section header with FoodCategory display label + item count, renders list of `GroceryItem`s — `src/components/grocery-list/GroceryGroup.tsx`
- [X] T044 [P] [US3] Build `AddItemForm` component: name, quantity, unit, optional category selector — submits to `GroceryContext` ADD_MANUAL dispatch — `src/components/grocery-list/AddItemForm.tsx`
- [X] T045 [US3] Create Grocery List page: "Refresh from Meal Plan" action button; renders all `GroceryGroup`s sorted by category; integrates `AddItemForm`; empty-state with CTA when no meal plan exists — `src/app/grocery-list/page.tsx`
- [X] T046 [P] [US3] Component test for `GroceryItem` (renders name + quantity + unit; check toggles checked style; edit quantity fires update; remove button visible only for manual items) — `tests/component/GroceryItem.test.tsx`
- [X] T047 [P] [US3] E2e test: populate meal plan → navigate to Grocery List → verify shared ingredient merged → check item → reload → verify persist → add manual item → verify in Other group → click Refresh → verify manual item preserved — `tests/e2e/grocery-list.spec.ts`

**Checkpoint**: US3 fully functional. Grocery list auto-generates from the active week's meal plan; check states and manual items persist across reloads.

---

## Phase 6: User Story 4 — Dashboard Overview (Priority: P4)

**Goal**: Landing page showing the current week's meal plan summary and grocery list preview.
All sections link through to their full-page views.

**Independent Test**: With a populated meal plan and partial grocery list, load the Dashboard —
the filled meal slots are visible, unchecked grocery item count is shown, and clicking a recipe
name navigates to its detail page.

### Implementation for User Story 4

- [X] T048 [P] [US4] Build `WeekSummary` component: compact 7-column grid showing day name + list of assigned recipe titles per meal type; empty slots shown as "—"; each recipe title is a link to its detail page; "Go to Meal Planner" CTA — `src/components/dashboard/WeekSummary.tsx`
- [X] T049 [P] [US4] Build `GroceryPreview` component: unchecked item count headline; up to 8 top grocery items (ordered by category, then displayOrder); "View Full List" CTA link; empty state when no list — `src/components/dashboard/GroceryPreview.tsx`
- [X] T050 [US4] Create Dashboard page: assembles `WeekSummary` and `GroceryPreview`; reads current ISO week from `MealPlanContext` and `GroceryContext`; page hero shows current week date range — `src/app/page.tsx`

**Checkpoint**: US4 fully functional. Dashboard reflects current week data; all links navigate correctly.

---

## Phase 7: User Story 5 — Recipe Discovery & Filtering (Priority: P5)

**Goal**: Search recipes by title keyword or ingredient name; filter by one or more dietary tags
(AND logic); toggle between card grid and compact list view.

**Independent Test**: With ≥10 seed recipes, type "tomato" in search — only recipes containing
"tomato" in title or ingredients appear. Select "vegan" tag — only vegan recipes shown. Toggle list view — compact row layout renders.

### Implementation for User Story 5

- [X] T051 Extend `searchRecipes` in `src/services/recipes.ts` to support: partial ingredient name match, multi-tag AND filter; add unit tests for new paths in `tests/unit/services/recipes.test.ts`
- [X] T052 [P] [US5] Build `RecipeSearch` component: keyword search input (debounced, 300ms); multi-select tag filter pills (Breakfast, Lunch, Dinner, Healthy, Vegan, Vegetarian); card/list view toggle button; emits `{ keyword, tags, viewMode }` upward — `src/components/recipes/RecipeSearch.tsx`
- [X] T053 [US5] Update Recipes list page to pass `RecipeSearch` filter state into `searchRecipes`, re-render `RecipeList` on change; show "X results" count; show "No recipes match" empty state on zero results — `src/app/recipes/page.tsx`
- [X] T054 [US5] Update `RecipeList` to support `viewMode: 'grid' | 'list'` prop; in list mode render compact rows (title, cook time, tags only; no image) — `src/components/recipes/RecipeList.tsx`

**Checkpoint**: US5 fully functional. Search by name, search by ingredient, filter by tag, and view toggle all work on the Recipes page.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, accessibility, performance, and release readiness.

- [X] T055 [P] Implement orphan-slot detection in `WeekGrid` and `MealSlot`: if a `MealSlot.recipeId` is not found in the recipe store (deleted recipe), display a "Recipe removed — tap to replace" inline warning instead of the recipe card — `src/components/meal-planner/MealSlot.tsx`
- [X] T056 [P] Add empty-state UI (illustrated placeholder + CTA) to: Recipes page (no recipes yet), Meal Planner (no slots assigned this week), Grocery List (meal plan empty), Dashboard (no plan) — `src/components/recipes/RecipeList.tsx`, `src/app/meal-planner/page.tsx`, `src/app/grocery-list/page.tsx`, `src/app/page.tsx`
- [X] T057 [P] Add a 404 / not-found fallback page for unknown dynamic recipe IDs — `src/app/not-found.tsx`
- [X] T058 [P] Accessibility audit: add ARIA labels, `role`, and keyboard interaction to `MealSlot` (drag handle accessible via keyboard), `GroceryItem` checkbox, sidebar nav links, and modal dialogs — all affected component files
- [X] T059 Run full Playwright e2e suite; fix any regressions across all user stories — `tests/e2e/`
- [X] T060 Run Lighthouse audit (`npm run build` → `npx serve out` → audit); resolve any issues blocking Lighthouse Performance ≥ 90 on mobile (image sizing, bundle splitting, font loading)
- [X] T061 [P] Create `scripts/clear-storage-snippet.js` helper that prints a browser console snippet to clear all `rp:*` localStorage keys (referenced in quickstart.md) — `scripts/clear-storage-snippet.js`
- [X] T062 Validate `quickstart.md` end-to-end: follow every instruction from a clean checkout, confirm all commands succeed and the app works as described

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phases 3–7 (User Stories)**: All depend on Phase 2 completion
  - US1 (recipes service) is a prerequisite for US2, US3, and US4 at runtime, but can be developed in sequence without blocking US5
  - US2 is a prerequisite for US3 (Grocery List reads from MealPlan)
  - US4 (Dashboard) depends on US1 + US2 + US3 data existing in context
  - US5 (Discovery) extends US1 with no new blocking dependencies
- **Phase 8 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Can start after | Runtime dependency |
|-------|----------------|-------------------|
| US1 Recipe Management | Phase 2 | None |
| US2 Meal Planning | Phase 2 + US1 types | Reads Recipe store |
| US3 Grocery List | Phase 2 + US2 types | Reads MealPlan + Recipe stores |
| US4 Dashboard | Phase 2 + US1 + US2 + US3 | Reads all three stores |
| US5 Discovery & Filter | Phase 2 + US1 | Extends Recipe service only |

### Within Each User Story

1. Write service unit tests FIRST → confirm they FAIL
2. Implement service functions → confirm tests PASS
3. Build components in parallel (leaf → composite → page)
4. Write component tests and e2e tests
5. Verify story passes its **Independent Test** before marking complete

### Parallel Opportunities

Within Phase 2 (after T008 types are done): T009–T015 can all run in parallel.
Within Phase 3 (after T021 service is done): T022, T023, T024 can run in parallel.
Within Phase 5 (after T041 service is done): T042, T043, T044 can run in parallel.
Within Phase 6: T048 and T049 can run in parallel.
Phase 8 tasks T055–T058 and T061 can all run in parallel.

---

## Parallel Example: Phase 3 (US1)

```bash
# After T021 (recipes service) is done, launch in parallel:
Task T022: Build RecipeCard component
Task T023: Build RecipeForm component
Task T024: Build RecipeDetail component
# Then T025 (RecipeList) depends on T022 → sequential
# Then T026, T027 depend on components being done
```

---

## Implementation Strategy

### MVP Scope — US1 Only (Phases 1–3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — Recipe Management
4. **STOP and VALIDATE**: recipe library fully functional with localStorage persistence
5. Deploy static `out/` to CDN → working recipe book demo

### Incremental Delivery

| Increment | Phases | What the user gets |
|-----------|--------|--------------------|
| v0.1 — Recipe Book | 1 + 2 + 3 | Create/view/edit/delete recipes with persistence |
| v0.2 — Meal Planner | + 4 | Weekly meal planning grid with drag-and-drop |
| v0.3 — Grocery List | + 5 | Auto-generated shopping list from meal plan |
| v0.4 — Dashboard | + 6 | One-screen overview of week + grocery status |
| v0.5 — Discovery | + 7 | Search, filter, and view-toggle on recipe library |
| v1.0 — Production Ready | + 8 | Polish, accessibility, performance ≥ 90 |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 62 |
| **Phase 1 Setup** | 7 tasks |
| **Phase 2 Foundational** | 12 tasks (blocks all stories) |
| **US1 Recipe Management (P1)** | 11 tasks |
| **US2 Meal Planning (P2)** | 9 tasks |
| **US3 Grocery List (P3)** | 8 tasks |
| **US4 Dashboard (P4)** | 3 tasks |
| **US5 Discovery & Filtering (P5)** | 4 tasks |
| **Phase 8 Polish** | 8 tasks |
| **Parallelizable tasks [P]** | 36 tasks |
| **Service unit test tasks (TDD)** | 6 tasks (T012, T014, T020, T031, T040, T051) |
| **Component test tasks** | 4 tasks (T029, T038, T046) |
| **E2e test tasks** | 3 tasks (T030, T039, T047) |
| **Suggested MVP scope** | Phases 1–3 (US1 only: 30 tasks) |

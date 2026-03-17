# Research: Recipe Planner Web Application

**Branch**: `001-recipe-planner-app` | **Date**: 2026-03-11  
**Phase**: 0 — Resolves all NEEDS CLARIFICATION items from Technical Context

---

## 1. Next.js Static Export with App Router

**Decision**: Use Next.js 15 App Router with `output: 'export'` in `next.config.ts`.

**Rationale**:
- App Router is the current Next.js default; Pages Router is in maintenance mode.
- `output: 'export'` produces a fully static `out/` directory deployable to any CDN without a Node.js server.
- All five spec pages (Dashboard, Recipes, Recipe Detail, Meal Planner, Grocery List) are compatible with static generation since data is embedded — no `getServerSideProps` needed.
- Dynamic route `/recipes/[id]` is resolved at build time via `generateStaticParams()` over mock data.

**Alternatives considered**:
- **Next.js Pages Router** — rejected; App Router is the future default and has better layout composition for the persistent sidebar.
- **Vite + React (SPA)** — rejected; Next.js provides file-based routing out of the box, reducing boilerplate for 5 pages.
- **Remix** — rejected; Remix's data-loading model is optimised for server-side data fetching, which is unnecessary for a mock-data static app.

---

## 2. Client-Side State Management

**Decision**: React Context API with `useReducer`, one provider per module (3 total).

**Rationale**:
- Three independent state domains map cleanly to three Context providers: `RecipeContext`, `MealPlanContext`, `GroceryContext`.
- `useReducer` over `useState` enforces explicit action types — important for testability and for maintaining clear state transitions (e.g., `ADD_MEAL_SLOT`, `TOGGLE_GROCERY_ITEM`).
- No server state to sync; no need for `React Query` or `SWR`.
- Context is serialised to `localStorage` on every dispatch using a thin middleware effect so state survives page reloads (SC-007).

**Alternatives considered**:
- **Zustand** — considered; simpler API, but adds a dependency. Context + `useReducer` achieves the same result with zero additional packages and is sufficient for this scope.
- **Redux Toolkit** — rejected; overkill for ~6 entity types and no async middleware requirement.
- **URL state (search params)** — rejected for meal plan state; the 21-slot weekly grid contains too much data to encode in a URL meaningfully.

---

## 3. Persistence Without a Database

**Decision**: `localStorage` for runtime mutations (meal plan assignments, grocery check-off, manually added grocery items); static `src/data/*.ts` as the read-only seed for recipes.

**Rationale**:
- Spec SC-007 requires data to persist across browser sessions.
- `localStorage` is synchronous, always available in a browser, and requires no installation.
- Recipes are part of the static build (mock data) but user edits (add/edit/delete) are persisted to `localStorage` so the recipe library state survives reloads.
- On app initialisation, Context providers hydrate from `localStorage`; if no saved state exists they fall back to the seed data.

**localStorage key namespace**:
```
rp:recipes          → Recipe[]  (seed + user-added/edited)
rp:meal-plan:{week} → MealPlan  (keyed by ISO week string, e.g. "2026-W11")
rp:grocery:{week}   → GroceryList
```

**Alternatives considered**:
- **IndexedDB** — rejected; the dataset is small (<100 recipes, <21 meal slots/week) and IndexedDB's async API adds complexity without benefit.
- **Cookie storage** — rejected; size limits (4KB) are too small for recipe data.
- **No persistence (in-memory only)** — rejected; directly fails SC-007.

---

## 4. Ingredient Aggregation & Normalization

**Decision**: Pure TypeScript utility functions in `src/lib/ingredientUtils.ts`.

**Rationale**:
- Normalization: trim whitespace, lowercase, collapse multiple spaces. Applied at write-time (recipe create/edit) and at grocery list generation.
- Aggregation: group grocery items by `(normalizedName, unit)` composite key; sum quantities. Items with different units are kept as separate rows (spec edge case: incompatible units).
- Fraction/decimal quantities stored as `number` (float); display formatted with up to 2 decimal places.

**Unit handling**:
- Supported units with known conversions (g↔kg only): auto-convert to canonical unit during aggregation.
- All other unit mismatches → separate rows.

**Alternatives considered**:
- **Fraction.js / math.js** — rejected; no fractional arithmetic needed beyond basic float sums.
- **Server-side aggregation** — N/A; no server.

---

## 5. Drag-and-Drop for Meal Planner

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop recipe assignment on the meal plan grid.

**Rationale**:
- `@dnd-kit` is the current standard for accessible DnD in React; actively maintained, works with keyboard navigation.
- Native HTML5 DnD API has poor mobile support and inconsistent browser behaviour.
- The DnD requirement is explicitly in FR-012 and US2 acceptance scenario 2.

**Alternatives considered**:
- **react-beautiful-dnd** — rejected; deprecated, no longer maintained.
- **Plain pointer events** — rejected; re-implementing accessibility (ARIA, keyboard) would exceed effort.

---

## 6. Testing Strategy

**Decision**: Jest + React Testing Library for unit/component tests; Playwright for e2e.

**Rationale**:
- Jest is the default test runner bundled with Next.js (`next/jest` config preset).
- React Testing Library enforces user-centric testing (interactions by role/label, not implementation).
- Playwright covers the three critical e2e paths: recipe CRUD, meal plan assignment, grocery generation.
- Services (`recipes.ts`, `mealPlanner.ts`, `groceryList.ts`) are pure TypeScript functions — tested with plain Jest, no DOM needed.

**Test targets per module (TDD order)**:
1. `ingredientUtils.ts` — normalization, aggregation (unit tests first)
2. `groceryList.ts` service — deduplication logic
3. `mealPlanner.ts` service — slot assignment rules
4. `recipes.ts` service — CRUD over in-memory state
5. Component tests — `MealSlot`, `GroceryItem`, `RecipeCard`
6. E2e — full user journeys

---

## 7. Tailwind CSS Configuration

**Decision**: Tailwind CSS v3 with `tailwind.config.ts`; no additional UI kit.

**Rationale**:
- Utility-first CSS matches the component-heavy Next.js structure and avoids style conflicts.
- Custom design tokens (color palette, spacing) defined in `tailwind.config.ts` `theme.extend` to establish consistent dashboard appearance.
- `clsx` + `tailwind-merge` used for conditional class composition in components.
- No third-party component library (shadcn/ui, MUI, etc.) to avoid over-engineering for a mock-data demo.

**Alternatives considered**:
- **shadcn/ui** — considered as a component starter; rejected to keep the dependency surface minimal and keep styling fully under control.
- **CSS Modules** — rejected; Tailwind eliminates the need for per-component stylesheets in this scope.

---

## NEEDS CLARIFICATION — All Resolved

| Item | Resolution |
|------|-----------|
| Auth method | No auth for v1 static demo; spec assumption documents this as email+password for v1, but for the static site scope auth is skipped — data is single-user local state |
| Database | None — `localStorage` + static `src/data/*.ts` |
| Week start day | Monday (ISO 8601 week, spec assumption §Assumptions) |
| Unit conversion | g↔kg only; all other mismatches → separate grocery rows |
| Tag vocabulary | Fixed: Breakfast, Lunch, Dinner, Healthy, Vegan, Vegetarian |
| Food category mapping | Predefined mapping in `src/data/categories.ts`; unmatched → Other |
| Photo storage | Optional URL string field; static images in `public/images/recipes/` |

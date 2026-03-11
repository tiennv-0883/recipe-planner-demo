# Quickstart: Recipe Planner Web Application

**Branch**: `001-recipe-planner-app` | **Date**: 2026-03-11

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20.x |
| npm | 10.x (bundled with Node 20) |

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app loads with ~20 pre-seeded recipes from `src/data/recipes.ts`. Any changes you make
(add recipe, assign meal slots, check off grocery items) are auto-saved to `localStorage`.

---

## 3. Build Static Site

```bash
npm run build
```

This runs `next build` with `output: 'export'`. The output is written to the `out/` directory
as static HTML/CSS/JS.

---

## 4. Preview the Static Build Locally

```bash
npx serve out
```

Open [http://localhost:3000](http://localhost:3000) (or the port `serve` assigns).

---

## 5. Run Tests

```bash
# Unit + component tests (Jest + React Testing Library)
npm test

# Watch mode
npm run test:watch

# E2e tests (Playwright — requires dev server running)
npm run test:e2e

# All tests + coverage report
npm run test:coverage
```

---

## 6. Reset Mock Data

All runtime state is stored in `localStorage`. To reset to the seed data:

1. Open browser DevTools → Application → Local Storage → `http://localhost:3000`
2. Delete all keys prefixed with `rp:`

Or use the helper script:`

```bash
# Outputs JS snippet you can paste into browser console to clear app state
node scripts/clear-storage-snippet.js
```

---

## 7. Project Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Next.js dev server with HMR |
| Production build | `npm run build` | Static export to `out/` |
| Type check | `npm run type-check` | `tsc --noEmit` |
| Lint | `npm run lint` | ESLint via Next.js config |
| Format | `npm run format` | Prettier on `src/` |
| Unit tests | `npm test` | Jest |
| E2e tests | `npm run test:e2e` | Playwright |
| Coverage | `npm run test:coverage` | Jest with `--coverage` |

---

## 8. Key Files at a Glance

| File | Purpose |
|------|---------|
| `src/data/recipes.ts` | ~20 seed recipes (mock data source of truth) |
| `src/data/categories.ts` | Ingredient name → food category mapping |
| `src/types/index.ts` | All TypeScript entity interfaces |
| `src/services/recipes.ts` | Recipe CRUD business logic |
| `src/services/mealPlanner.ts` | Meal slot assignment logic |
| `src/services/groceryList.ts` | Ingredient aggregation & grocery list logic |
| `src/lib/ingredientUtils.ts` | Name normalization, unit aggregation |
| `src/lib/weekUtils.ts` | ISO week helpers |
| `src/lib/storage.ts` | `localStorage` read/write helpers |
| `src/context/RecipeContext.tsx` | Recipe state provider |
| `src/context/MealPlanContext.tsx` | Meal plan state provider |
| `src/context/GroceryContext.tsx` | Grocery list state provider |

---

## 9. Deployment

The `out/` directory is a self-contained static site. Deploy to any static host:

**Vercel** (recommended for Next.js):
```bash
vercel --prod
```

**Netlify**:
```bash
netlify deploy --dir out --prod
```

**GitHub Pages**:
Set `basePath` in `next.config.ts` if serving from a sub-path (e.g. `/recipe-planner`),
then push `out/` to the `gh-pages` branch.

# Tasks: Supabase Backend Migration

**Input**: Design documents from `specs/002-supabase-migration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Branch**: `002-supabase-migration` | **Start ID**: T063

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US5)
- No story label = Setup / Foundational / Polish phase

---

## Phase 9: Supabase Project Setup + Schema

**Purpose**: Install packages, configure clients, create DB schema, wire middleware.
This phase BLOCKS all user-story phases.

**⚠️ CRITICAL**: Complete all tasks in this phase before any Phase 10+ work.

- [X] T063 Remove `output: 'export'` from `next.config.ts` (enables API Routes + fixes BUG-001)
- [X] T064 Install Supabase packages: `npm install @supabase/supabase-js @supabase/ssr`
- [X] T065 [P] Create `.env.local` with Supabase env var placeholders and verify `.gitignore` excludes it
- [X] T066 [P] Create `.env.local.example` with placeholder values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [X] T067 Create `supabase/migrations/001_initial_schema.sql` with full DDL: all 8 tables (`user_profiles`, `recipes`, `ingredient_lines`, `preparation_steps`, `meal_plans`, `meal_slots`, `grocery_lists`, `grocery_items`), constraints, indexes, and RLS policies per `data-model.md`
- [ ] T068 Run `001_initial_schema.sql` in Supabase SQL Editor and verify all tables appear in Table Editor
- [X] T069 Create `src/lib/supabase/server.ts` — server-side Supabase client using `@supabase/ssr` `createServerClient()` with cookie adapter for Route Handlers
- [X] T070 [P] Create `src/lib/supabase/client.ts` — browser Supabase client using `@supabase/ssr` `createBrowserClient()`
- [X] T071 [P] Create `src/lib/supabase/types.ts` — TypeScript types matching PostgreSQL rows (snake_case DB rows `DbRecipe`, `DbIngredientLine`, etc.)
- [X] T072 Create `middleware.ts` at repo root — reads Supabase session cookie, calls `supabase.auth.getUser()` to refresh token on every request; redirects unauthenticated requests to `/login` for protected routes

**Checkpoint**: `npm run build` passes, Supabase tables exist, middleware file present.

---

## Phase 10: Authentication UI + API (US1 + US4)

**User Story 1 — Account Registration & Login (P1)**
**User Story 4 — Data Privacy: Each User Sees Only Their Own Data (P1)**

**Goal**: Users can register, log in, and log out. All protected routes redirect to `/login` for unauthenticated users. RLS ensures per-user data isolation at database level.

**Independent Test**: Open app in incognito → redirected to `/login`. Register → Dashboard loads. Log out → back to `/login`. Log in from different browser → same account.

- [X] T073 [US1] Create `src/app/(auth)/layout.tsx` — minimal layout for auth pages (no nav, centered card)
- [X] T074 [US1] Create `src/app/(auth)/login/page.tsx` — login form: email + password fields, submit calls `POST /api/auth/login`, redirects to `/` on success, shows error message on failure
- [X] T075 [US1] Create `src/app/(auth)/signup/page.tsx` — sign-up form: email + password fields, client-side validation (min 8 chars), submit calls `POST /api/auth/signup`, redirects to `/` on success
- [X] T076 [US1] Create `src/app/api/auth/signup/route.ts` — validates input, calls `supabase.auth.signUp()`, returns 201 with user or 400/409 per `contracts/auth.md`
- [X] T077 [US1] Create `src/app/api/auth/login/route.ts` — calls `supabase.auth.signInWithPassword()`, queries `user_profiles.seeded_at`, returns 200 with `{ user, seeded }` or 401 per contract
- [X] T078 [US1] Create `src/app/api/auth/logout/route.ts` — calls `supabase.auth.signOut()`, clears session cookie, returns 200
- [X] T079 [US1] Create `src/app/api/auth/me/route.ts` — returns current user + seeded flag, returns 401 if unauthenticated
- [X] T080 [US1] Create `src/context/AuthContext.tsx` — React context holding `user` state; on mount calls `GET /api/auth/me` to check session; exposes `login()`, `logout()`, `signup()` that call respective API routes
- [X] T081 [US1] Update `src/app/layout.tsx` to wrap app with `<AuthContext>` and redirect unauthenticated clients away from protected pages
- [X] T082 [US1] Create `src/components/LogoutButton.tsx` — button that calls `logout()` from AuthContext and clears local state; add to site navigation

**Checkpoint**: Register → Dashboard. Logout → `/login`. Login → Dashboard. Two accounts cannot see each other's data (verified via SQL RLS policies applied in T067).

---

## Phase 11: Recipe API Routes + Migrate Service (US2)

**User Story 2 — Personal Recipe Collection Persists Across Devices (P2)**

**Goal**: Full recipe CRUD backed by Supabase. RecipeContext reads/writes via API instead of localStorage. Recipe data persists across browsers.

**Independent Test**: Create recipe on Device A → view on Device B (same account). Clear localStorage → log in → recipes still visible.

- [X] T083 Create `src/lib/supabase/mappers.ts` — `toDomainRecipe()`, `toDbRecipe()`, `toDomainIngredientLine()`, `toDbIngredientLine()`, `toDomainStep()`, `toDbStep()` (camelCase ↔ snake_case transformations)
- [X] T084 [P] [US2] Create `src/app/api/recipes/route.ts` — `GET` (list non-deleted recipes, supports `?q=` and `?tags=` query params, calls `listRecipes()` + `searchRecipes()` service functions on DB results); `POST` (create recipe, validates input, inserts `recipes` + `ingredient_lines` + `preparation_steps` rows)
- [X] T085 [P] [US2] Create `src/app/api/recipes/[id]/route.ts` — `GET` (single recipe with ingredients + steps); `PUT` (update recipe, replaces ingredient_lines and preparation_steps arrays); `DELETE` (soft-delete: sets `deleted_at`)
- [X] T086 [US2] Create `src/app/api/recipes/seed/route.ts` — `POST`: checks `user_profiles.seeded_at`, if NULL inserts 20 recipes from `src/data/recipes.ts` using service-role client, sets `seeded_at`, returns `{ count: 20 }`; if already seeded returns `{ count: 0, message: "Already seeded" }`
- [X] T087 [US2] Update `src/context/RecipeContext.tsx` — replace all `getItem()`/`setItem()` localStorage calls with `fetch('/api/recipes', ...)` calls; preserve same context interface so all components remain unchanged
- [X] T088 [P] [US2] Update `src/app/api/recipes/seed/route.ts` to use `src/data/supabase-seed.ts` helper (create `src/data/supabase-seed.ts` mapping `RECIPES` mock array to DB insert format with `user_id` field)
- [X] T089 [P] [US2] Fix `src/app/recipes/[id]/page.tsx` (BUG-001): remove any `generateStaticParams` export; confirm page uses `useParams()` as a Client Component — no split needed since `output: 'export'` removed in T063
- [X] T090 [P] [US2] Fix `src/app/recipes/[id]/edit/page.tsx` (BUG-001 same): verify no `generateStaticParams` export, confirm `useParams()` Client Component pattern works

**Checkpoint**: `npm run build` succeeds. Create recipe → reload → still there. Create on one device → visible on another device. Old localStorage data no longer used.

---

## Phase 12: MealPlan API Routes + Migrate Service (US3)

**User Story 3 — Meal Plan & Grocery List Persist Across Devices (P3)**

**Goal**: Meal plan slots persist in Supabase per user, per ISO week. MealPlanContext reads/writes via API.

**Independent Test**: Assign recipe to Monday Breakfast on Device A → open Meal Planner on Device B → same slot shows correct recipe.

- [X] T091 [US3] Create `src/app/api/meal-plans/[week]/route.ts` — `GET`: fetches `meal_plans` + `meal_slots` for `(user_id, iso_week)`, returns `{ mealPlan: { isoWeek, slots, updatedAt } }` (empty slots array if no plan exists, not a 404)
- [X] T092 [US3] Create `src/app/api/meal-plans/[week]/slots/route.ts` — `POST`: upserts a `meal_slots` row for `(meal_plan_id, day, meal_type)`; creates `meal_plans` row first if it doesn't exist; validates `day` and `mealType` values per domain types
- [X] T093 [US3] Create `src/app/api/meal-plans/[week]/slots/[slotId]/route.ts` — `DELETE`: removes a single `meal_slots` row owned by the authenticated user
- [X] T094 [US3] Update `src/context/MealPlanContext.tsx` — replace localStorage reads/writes with `fetch('/api/meal-plans/[week]', ...)` calls; preserve existing context interface (`getMealPlan`, `assignRecipe`, `clearSlot`)

**Checkpoint**: Assign recipe to slot → reload → slot persists. View previous week → correct plan shown. Different user sees their own plan only.

---

## Phase 13: GroceryList API Routes + Migrate Service (US3)

**Goal**: Grocery lists persist in Supabase per user, per ISO week. GroceryContext reads/writes via API. Ingredient aggregation logic remains in `src/services/groceryList.ts` (pure function, called server-side from Route Handler).

**Independent Test**: Generate grocery list → reload on different device → same items. Check off item on phone → reload on laptop → item remains checked.

- [X] T095 [US3] Create `src/app/api/grocery-lists/[week]/route.ts` — `GET`: fetches `grocery_lists` + `grocery_items` for `(user_id, iso_week)`, returns full list (empty items array if not yet generated)
- [X] T096 [US3] Create `src/app/api/grocery-lists/[week]/generate/route.ts` — `POST`: fetches meal plan for the week, resolves recipes, calls `generateGroceryList()` service function, replaces auto-generated items in DB while preserving `is_manual=true` items and their `checked` states
- [X] T097 [US3] Create `src/app/api/grocery-lists/[week]/items/route.ts` — `POST`: adds a manual grocery item (`is_manual=true`) to the list; creates the `grocery_lists` row if it doesn't exist
- [X] T098 [US3] Create `src/app/api/grocery-lists/[week]/items/[id]/route.ts` — `PATCH`: toggles `checked` boolean on a grocery item; `DELETE`: removes item (any item, validated as owned by authenticated user)
- [X] T099 [US3] Update `src/context/GroceryContext.tsx` — replace localStorage reads/writes with API calls to `/api/grocery-lists/[week]`; preserve existing context interface (`generateList`, `toggleItem`, `addManualItem`, `removeManualItem`)

**Checkpoint**: Generate list → items appear. Check item → reload → item still checked. Manual item survives regeneration. Two users never see each other's grocery items.

---

## Phase 14: Seed Data Migration

**Purpose**: Ensure every new user gets 20 starter recipes on first login. Cross-cutting concern that ties auth + recipe API together.

- [X] T100 Create `src/data/supabase-seed.ts` — exports `SEED_RECIPES_FOR_USER(userId: string)` that maps `RECIPES` array from `src/data/recipes.ts` to `DbRecipe` insert format (adds `user_id`, generates new UUIDs so seed recipes are user-private, sets `created_at`/`updated_at`)
- [X] T101 Update `src/app/api/recipes/seed/route.ts` to import and use `SEED_RECIPES_FOR_USER()` from T100; use `SUPABASE_SERVICE_ROLE_KEY` client to bypass RLS for bulk insert; also inserts corresponding `ingredient_lines` and `preparation_steps` rows in same transaction-style batch
- [X] T102 Update auth flow in `src/context/AuthContext.tsx` — after successful login, if `seeded === false` (from `POST /api/auth/login` response), call `POST /api/recipes/seed`; only call once (guarded by `seeded` flag)

**Checkpoint**: Register new account → 20 recipes appear in My Recipes immediately. Register second account → same 20 fresh recipes (independent copies). Login again → seed NOT called again (seeded_at already set).

---

## Phase 15: Deploy Vercel + Env Vars (US5)

**User Story 5 — Deploy & Access via Public URL (P2)**

**Goal**: App is live at a public HTTPS URL. All features work in production. Environment secrets are configured in Vercel dashboard.

**Independent Test**: Open public URL in incognito → register → create recipe → assign to meal plan → generate grocery list → log out → log in → all data persists.

- [X] T103 [US5] Verify `npm run build` passes locally with no TypeScript errors (`npx tsc --noEmit` exit 0)
- [ ] T104 [US5] Push branch to GitHub; connect repo to Vercel via `vercel.com/new`; set Node.js version to 20.x in Vercel project settings
- [ ] T105 [US5] Add environment variables in Vercel dashboard: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] T106 [US5] Trigger Vercel deploy; verify build completes and app loads at public URL
- [ ] T107 [US5] Smoke test deployed app: register new account → 20 seed recipes appear → create recipe → assign to meal plan → generate grocery list → log out → log back in → all data persists

**Checkpoint**: Public URL is shareable. All 5 features (recipe CRUD, meal planning, grocery list, search/filter, dashboard) work end-to-end on Vercel.

---

## Phase 16: README + Polish

**Purpose**: Documentation, cleanup, submission readiness.

- [X] T108 [P] Update `README.md` with: public Vercel URL, local setup steps (reference `quickstart.md`), `npm install` + `.env.local` + SQL migration steps, `npm run dev` command
- [X] T109 [P] Update `specs/001-recipe-planner-app/tasks.md` — mark BUG-001 tasks as [X] now that `output: 'export'` is removed in T063
- [X] T110 Verify all 90 existing unit tests still pass: `npx jest tests/unit --no-coverage --forceExit`
- [ ] T111 [P] Run `npx tsc --noEmit` — confirm zero TypeScript errors across full codebase
- [ ] T112 Add screenshots to `README.md`: Dashboard, Recipe List, Meal Planner, Grocery List (capture after Vercel deploy)

**Checkpoint**: README has public URL + setup instructions. All 90 unit tests green. TypeScript clean. App screenshots in README.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 9 (Setup)**: No dependencies — start immediately
- **Phase 10 (Auth)**: Depends on Phase 9 complete — provides `user_id` needed by all data phases
- **Phase 11 (Recipes)**: Depends on Phase 10 complete (auth middleware required for all API routes)
- **Phase 12 (MealPlan)**: Depends on Phase 11 complete (meal slots reference `recipe_id`)
- **Phase 13 (GroceryList)**: Depends on Phase 12 complete (`generate` calls meal plan API)
- **Phase 14 (Seed)**: Depends on Phase 11 complete (seed endpoint must exist)
- **Phase 15 (Deploy)**: Depends on Phases 10–14 complete
- **Phase 16 (Polish)**: Depends on Phase 15 complete

### User Story Dependencies (within phases)

- **US1 (Auth, Phase 10)**: Depends only on Phase 9 — no other user story
- **US2 (Recipes, Phase 11)**: Depends on US1 auth being complete
- **US3 (MealPlan + Grocery, Phases 12–13)**: Depends on US2 (recipe IDs must exist in DB)
- **US4 (Privacy)**: Enforced by SQL RLS in Phase 9 + auth check in Phase 10 — not a separate phase
- **US5 (Deploy, Phase 15)**: Depends on US1–US3 + Phase 14

### Parallel Opportunities (within a phase)

- **Phase 9**: T065 + T066 in parallel; T069 + T070 + T071 in parallel
- **Phase 10**: T073 + T074 + T075 in parallel (UI); T076 + T077 + T078 + T079 in parallel (API routes)
- **Phase 11**: T084 + T085 in parallel; T089 + T090 in parallel (BUG-001 fixes)
- **Phase 16**: T108 + T109 + T111 + T112 in parallel

---

## Parallel Example: Phase 11 (Recipes)

```bash
# These can run simultaneously (different files):
Task T084: "Create src/app/api/recipes/route.ts"
Task T085: "Create src/app/api/recipes/[id]/route.ts"

# After T084 + T085 complete:
Task T086: "Create src/app/api/recipes/seed/route.ts"
Task T087: "Update src/context/RecipeContext.tsx"

# These can run in parallel with each other and with T086/T087:
Task T089: "Fix src/app/recipes/[id]/page.tsx (BUG-001)"
Task T090: "Fix src/app/recipes/[id]/edit/page.tsx (BUG-001)"
```

---

## Implementation Strategy

### MVP (Phase 9 + 10 only — US1 demonstrable)

1. Complete Phase 9: Supabase setup + schema
2. Complete Phase 10: Auth UI + API
3. **STOP and VALIDATE**: Register, login, logout work. `/login` redirect works.
4. Deploy to Vercel with only auth — already a demonstrable product increment.

### Incremental Delivery

1. Phase 9 + 10 → Auth works (US1 ✅)
2. Phase 11 → Recipes persist in cloud (US2 ✅)
3. Phase 12 + 13 → Meal plan + grocery list persist (US3 ✅)
4. Phase 14 → Seed data for new users (cross-cutting ✅)
5. Phase 15 → Public URL (US5 ✅)
6. Phase 16 → Submission-ready

---

## Notes

- BUG-001 (`generateStaticParams` missing) is fixed as a side-effect of T063 — no Server/Client split needed
- `src/services/recipes.ts`, `mealPlanner.ts`, `groceryList.ts` pure functions are **untouched** — they continue to be used server-side inside Route Handlers for business logic
- All Route Handlers start with an auth check (`supabase.auth.getUser()`) before any DB query — two-layer security with RLS
- `SUPABASE_SERVICE_ROLE_KEY` is only used in the seed endpoint (T086/T101) — never exposed to the browser
- The 90 existing unit tests in `tests/unit/` test pure service functions — they remain valid and must stay green throughout this migration

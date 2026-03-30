# Tasks: Multi-Language Support (Vietnamese Default + English)

**Input**: Design documents from `specs/006-multi-language/`  
**Branch**: `006-multi-language`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/translations.md](./contracts/translations.md) | **Research**: [research.md](./research.md)  
**Start Task ID**: T162 (continuing from spec 005 last task T161)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[US1]–[US3]**: Which user story this task primarily serves
- File paths are from project root
- **No unit tests** — not explicitly requested in spec (spec has no TDD/test requirement for i18n)

---

## Phase 34: Setup — Install next-intl and Create i18n Infrastructure

**Purpose**: Install the `next-intl` library and create the 5 new infrastructure files (config, routing, request, next.config wrapper, message bundles) that every subsequent task depends on. This phase MUST be complete before any translation work begins.

**⚠️ CRITICAL**: No user story implementation can begin until Phases 34 and 35 are complete.

- [X] T162 Run `npm install next-intl` from project root to add the next-intl dependency (adds ~25 kB gzipped; verify it appears in `package.json` dependencies)
- [X] T163 Create `src/i18n/config.ts` with `LOCALES = ['vi', 'en'] as const`, `DEFAULT_LOCALE = 'vi' as const`, and export `Locale` type (`'vi' | 'en'`)
- [X] T164 Create `src/i18n/routing.ts` using `defineRouting` from `next-intl/routing` — set `locales: LOCALES`, `defaultLocale: DEFAULT_LOCALE`, `localePrefix: 'never'` (satisfies FR-009: no URL prefix)
- [X] T165 Create `src/i18n/request.ts` implementing `getRequestConfig` from `next-intl/server` — read `NEXT_LOCALE` cookie from `next/headers` cookies(); validate value is in `['vi', 'en']`, fallback to `'vi'` if absent or invalid (satisfies FR-001, FR-008); import messages via `(await import(\`../../messages/${locale}.json\`)).default`
- [X] T166 Update `next.config.ts` by wrapping the existing config export with `createNextIntlPlugin('./src/i18n/request.ts')` from `next-intl/plugin` — preserve all existing config options
- [X] T167 Create `src/app/actions/locale.ts` — Server Action `setLocale(locale: Locale)` that calls `cookies().set('NEXT_LOCALE', locale, { path: '/', maxAge: 31_536_000, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })` then revalidates (mark file with `'use server'`)

**Checkpoint**: `tsc --noEmit` passes. `next build` or `next dev` starts without errors. The 5 new files exist: `src/i18n/config.ts`, `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/app/actions/locale.ts`, and `next.config.ts` uses `createNextIntlPlugin`.

---

## Phase 35: Message Bundles — Create vi.json and en.json

**Purpose**: Create the two message bundle files containing all 112 translation keys × 2 locales = 224 key-value pairs. Both files must have identical key structures. This phase blocks all page/component translation work.

**⚠️ CRITICAL**: All 9 namespaces must be complete before Phase 37 (translation wiring) begins.

- [X] T168 [P] Create `messages/vi.json` with the complete 9-namespace nested structure — `auth` namespace (21 keys): layout tagline "Ứng dụng lên kế hoạch bữa ăn của bạn", login fields (title, emailLabel, passwordLabel, submit "Đăng nhập", submitting "Đang đăng nhập…", noAccount, signUp, placeholder.email, error.required, error.failed), signup fields (title, passwordHint, submit "Đăng ký", submitting "Đang đăng ký…", hasAccount, signIn, error.emailRequired, error.emailInvalid, error.passwordTooShort, error.failed)
- [X] T169 [P] Continue `messages/vi.json` — `nav` namespace (9 keys): dashboard "Trang chủ", recipes "Công thức", mealPlanner "Lên kế hoạch", groceryList "Danh sách mua sắm", signOut "Đăng xuất", brand "Recipe Planner", language.vi "Tiếng Việt", language.en "English"; `notFound` namespace (4 keys): title, description, goHome, browseRecipes; `common` namespace (1 key): skipToContent "Chuyển đến nội dung chính"
- [X] T170 [P] Continue `messages/vi.json` — `dashboard` namespace (14 keys): title "Tổng quan", subtitle, stats.totalRecipes "Tổng công thức", stats.mealsPlanned "Bữa ăn đã lên kế hoạch", stats.groceryItemsLeft "Nguyên liệu còn lại", weekAtAGlance.title "Tuần này", weekAtAGlance.manage "Quản lý", weekAtAGlance.mealsPlanned (ICU: "{count} bữa đã lên kế hoạch"), weekAtAGlance.slotsEmpty (ICU: "{count} ô trống"), weekAtAGlance.noMeals, weekAtAGlance.emptyWeek, weekAtAGlance.planMeals, recentRecipes.title "Công thức gần đây", recentRecipes.viewAll "Xem tất cả", recentRecipes.empty "Chưa có công thức nào"
- [X] T171 [P] Continue `messages/vi.json` — `recipes` namespace (46 keys): title "Công thức của tôi", inYourCollection, found, newRecipe "Thêm công thức", empty.noFilters, empty.withFilters, search.placeholder, search.ariaLabel, filter.clear, filter.ariaLabel; detail group (notFound, notFoundSub, backToRecipes "Quay lại", edit "Chỉnh sửa", delete "Xóa", ingredients "Nguyên liệu", instructions "Hướng dẫn", servings ICU "{n} khẩu phần", min ICU "{n} phút"); form group (titleLabel, titlePlaceholder, cookTimeLabel, servingsLabel, tagsLabel, ingredientsLabel, stepsLabel, photoLabel, photoHint, namePlaceholder, qtyPlaceholder, unitPlaceholder, addIngredient, addStep, clickToUpload, saving "Đang lưu…", cancel "Hủy", errors.titleRequired, errors.cookTimeInvalid, errors.servingsInvalid, errors.tagsRequired, errors.ingredientsRequired, errors.stepsRequired); picker group (chooseRecipe, noFound, servings ICU "{n} khẩu phần", searchAriaLabel, closeAriaLabel)
- [X] T172 [P] Continue `messages/vi.json` — `mealPlanner` namespace (16 keys): title "Kế hoạch bữa ăn", subtitle ICU "{filled}/{total} ô đã điền", clearWeek "Xóa tuần", clearConfirm, empty.title, empty.subtitle, days.mon "Thứ 2", days.tue "Thứ 3", days.wed "Thứ 4", days.thu "Thứ 5", days.fri "Thứ 6", days.sat "Thứ 7", days.sun "Chủ nhật", meals.breakfast "Sáng", meals.lunch "Trưa", meals.dinner "Tối", weekNav.thisWeek "Tuần này"; `groceryList` namespace (17 keys): title "Danh sách mua sắm", remaining ICU "{n} nguyên liệu còn lại", remainingOne "1 nguyên liệu còn lại", generate "Tạo danh sách", regenerate "Tạo lại", planMealsFirst, empty.noMeals.title, empty.noMeals.subtitle, empty.noMeals.goToPlanner, empty.noItems "Danh sách trống", addManual.trigger, addManual.title, addManual.itemName, addManual.qty, addManual.unit, addManual.add "Thêm", addManual.cancel "Hủy"; `categories` namespace (6 keys): vegetables_fruits "Rau củ & trái cây", meat_fish "Thịt & cá", dairy_eggs "Sữa & trứng", grains_bread "Ngũ cốc & bánh mì", spices_seasonings "Gia vị", other "Khác"
- [X] T173 [P] Create `messages/en.json` with identical key structure to `messages/vi.json` — `auth`: layout.tagline "Your personal meal planning app", login (title "Sign in", emailLabel "Email address", passwordLabel "Password", submit "Sign in", submitting "Signing in…", noAccount "Don't have an account?", signUp "Sign up", placeholder.email "you@example.com", error.required "Email and password are required", error.failed "Invalid email or password"), signup (title "Create account", passwordHint "At least 6 characters", submit "Create account", submitting "Creating account…", hasAccount "Already have an account?", signIn "Sign in", errors: emailRequired, emailInvalid, passwordTooShort, failed); `nav`: dashboard "Dashboard", recipes "Recipes", mealPlanner "Meal Planner", groceryList "Grocery List", signOut "Sign out", brand "Recipe Planner", language.vi "Tiếng Việt", language.en "English"; `notFound`: title "Page not found", description "The page you're looking for doesn't exist", goHome "Go home", browseRecipes "Browse recipes"; `common`: skipToContent "Skip to main content"
- [X] T174 [P] Continue `messages/en.json` — `dashboard`: title "Dashboard", subtitle, stats (totalRecipes "Total Recipes", mealsPlanned "Meals Planned", groceryItemsLeft "Grocery Items Left"), weekAtAGlance (title "Week at a Glance", manage "Manage", mealsPlanned "{count} meals planned", slotsEmpty "{count} slots empty", noMeals, emptyWeek, planMeals "Plan Meals"), recentRecipes (title "Recent Recipes", viewAll "View all", empty "No recipes yet"); `recipes`: title "My Recipes", inYourCollection, found, newRecipe "New Recipe", empty.noFilters "No recipes yet — add your first one!", empty.withFilters "No recipes match your filters", search (placeholder "Search recipes…", ariaLabel "Search recipes"), filter (clear "Clear filters", ariaLabel "Filter recipes"); detail (notFound "Recipe not found", notFoundSub "This recipe doesn't exist or has been deleted", backToRecipes "Back to Recipes", edit "Edit", delete "Delete", ingredients "Ingredients", instructions "Instructions", servings "{n} servings", min "{n} min"); form (titleLabel "Title", titlePlaceholder "Recipe name", cookTimeLabel "Cook time (min)", servingsLabel "Servings", tagsLabel "Tags", ingredientsLabel "Ingredients", stepsLabel "Steps", photoLabel "Photo", photoHint "JPG, PNG, or WebP · max 5 MB", namePlaceholder "Ingredient name", qtyPlaceholder "Qty", unitPlaceholder "Unit", addIngredient "Add ingredient", addStep "Add step", clickToUpload "Click to upload photo", saving "Saving…", cancel "Cancel", errors: titleRequired, cookTimeInvalid, servingsInvalid, tagsRequired, ingredientsRequired, stepsRequired); picker (chooseRecipe "Choose a recipe", noFound "No recipes found", servings "{n} servings", searchAriaLabel "Search recipes", closeAriaLabel "Close picker")
- [X] T175 [P] Continue `messages/en.json` — `mealPlanner`: title "Meal Planner", subtitle "{filled} of {total} slots filled", clearWeek "Clear week", clearConfirm "Clear all meals for this week?", empty (title "No meals planned", subtitle "Add recipes to your meal plan to get started"), days (mon "Mon", tue "Tue", wed "Wed", thu "Thu", fri "Fri", sat "Sat", sun "Sun"), meals (breakfast "Breakfast", lunch "Lunch", dinner "Dinner"), weekNav.thisWeek "This week"; `groceryList`: title "Grocery List", remaining "{n} items remaining", remainingOne "1 item remaining", generate "Generate list", regenerate "Regenerate", planMealsFirst "Plan some meals first to generate your grocery list", empty.noMeals (title "No grocery list yet", subtitle "Plan your meals for the week to auto-generate a grocery list", goToPlanner "Go to Meal Planner"), empty.noItems "Your grocery list is empty", addManual (trigger "Add item", title "Add item manually", itemName "Item name", qty "Qty", unit "Unit", add "Add", cancel "Cancel"); `categories`: vegetables_fruits "Vegetables & Fruits", meat_fish "Meat & Fish", dairy_eggs "Dairy & Eggs", grains_bread "Grains & Bread", spices_seasonings "Spices & Seasonings", other "Other"

**Checkpoint**: Both `messages/vi.json` and `messages/en.json` exist and are valid JSON. Both files have identical key structures. Total keys in each file: 112 across 9 namespaces. `JSON.parse(fs.readFileSync('messages/vi.json'))` and `JSON.parse(fs.readFileSync('messages/en.json'))` succeed without errors.

---

## Phase 36: Wire Up NextIntlClientProvider in Root Layout

**Purpose**: Make `src/app/layout.tsx` async and wrap `{children}` with `NextIntlClientProvider` so all client components can call `useTranslations()`. This single task unblocks all Phase 37 translation work.

**⚠️ Depends on**: T162 (next-intl installed), T165 (request.ts created), T168–T175 (message bundles)

- [X] T176 Update `src/app/layout.tsx` — make the component `async`, call `const locale = await getLocale()` (from `next-intl/server`) and `const messages = await getMessages()` (from `next-intl/server`), wrap the existing `{children}` JSX with `<NextIntlClientProvider locale={locale} messages={messages}>`, add `lang={locale}` attribute to the `<html>` tag (replaces any hardcoded `lang="en"`); add `useTranslations('common')` call for skip-to-content link and replace its hardcoded string with `t('skipToContent')`

**Checkpoint**: Run `npm run dev`. Navigate to any page. No hydration errors in the console. `document.documentElement.lang` equals `'vi'` on first load.

---

## Phase 37: Replace Hardcoded Strings — Pages and Components

**Purpose**: Replace all hardcoded English UI strings in 24 files with `useTranslations()` calls, organized by domain namespace. Tasks within each group are independently parallelizable — they touch different files.

**⚠️ Depends on**: T176 (NextIntlClientProvider wired) and T168–T175 (all message bundles complete)

### Group B1 — Auth Namespace (US1 + US3 baseline)

- [X] T177 [P] [US1] Update `src/app/(auth)/layout.tsx` — add `useTranslations('auth')`, replace hardcoded tagline string with `t('layout.tagline')`
- [X] T178 [P] [US1] Update `src/app/(auth)/login/page.tsx` — add `useTranslations('auth')`, replace all 9 hardcoded strings: page title, email label, password label, submit button, submitting state, no-account prompt, sign-up link, email placeholder, error messages (required, failed) with `t('login.*')` keys
- [X] T179 [P] [US1] Update `src/app/(auth)/signup/page.tsx` — add `useTranslations('auth')`, replace all 9 hardcoded strings: page title, password hint, submit button, submitting state, has-account prompt, sign-in link, and 4 error messages (emailRequired, emailInvalid, passwordTooShort, failed) with `t('signup.*')` keys

**Checkpoint US1 (auth subset)**: Open the app in Vietnamese (no cookie). Verify Login page and Signup page show only Vietnamese text.

### Group B2 — Dashboard Namespace (US1 baseline)

- [X] T180 [P] [US1] Update `src/app/page.tsx` (dashboard page) — add `useTranslations('dashboard')`, replace 6 hardcoded strings: page title, subtitle, and 3 stats labels (totalRecipes, mealsPlanned, groceryItemsLeft) with `t('title')`, `t('subtitle')`, `t('stats.*')` keys
- [X] T181 [P] [US1] Update `src/components/dashboard/WeekAtAGlance.tsx` — add `useTranslations('dashboard')`, replace 5 hardcoded strings: section title "Week at a Glance", "Manage" button, `{count} meals planned` (ICU), `{count} slots empty` (ICU), empty-state messages (noMeals, emptyWeek, planMeals) with `t('weekAtAGlance.*')` keys; pass count variables to ICU-parameterized keys
- [X] T182 [P] [US1] Update `src/components/dashboard/RecentRecipes.tsx` — add `useTranslations('dashboard')`, replace 3 hardcoded strings: section title "Recent Recipes", "View all" link, empty-state text with `t('recentRecipes.*')` keys

**Checkpoint US1 (dashboard)**: Navigate to `/` (dashboard). All stat labels, the "Week at a Glance" section, and "Recent Recipes" section display in Vietnamese.

### Group B3 — Recipes Namespace, List and Detail (US1 baseline)

- [X] T183 [P] [US1] Update `src/app/recipes/page.tsx` — add `useTranslations('recipes')`, replace 5 hardcoded strings: page title "My Recipes", "in your collection" text, results count, "New Recipe" button, empty-state messages (noFilters, withFilters) with `t('title')`, `t('inYourCollection')`, `t('found')`, `t('newRecipe')`, `t('empty.*')` keys
- [X] T184 [P] [US1] Update `src/app/recipes/[id]/page.tsx` — add `useTranslations('recipes')`, replace 2 hardcoded strings: "Recipe not found" heading and sub-text with `t('detail.notFound')`, `t('detail.notFoundSub')`
- [X] T185 [P] [US1] Update `src/components/recipes/RecipeDetail.tsx` — add `useTranslations('recipes')`, replace 7 hardcoded strings: "Back to Recipes" link, "Edit" button, "Delete" button, "Ingredients" heading, "Instructions" heading, servings ICU (`{n} servings`), cook time ICU (`{n} min`) with `t('detail.*')` keys; pass `n` variable to ICU keys
- [X] T186 [P] [US1] Update `src/components/recipes/RecipeFilters.tsx` — add `useTranslations('recipes')`, replace 2 hardcoded strings: "Clear filters" button text and aria-label with `t('filter.clear')`, `t('filter.ariaLabel')`
- [X] T187 [P] [US1] Update `src/components/recipes/RecipeSearch.tsx` — add `useTranslations('recipes')`, replace 2 hardcoded strings: search input placeholder and aria-label with `t('search.placeholder')`, `t('search.ariaLabel')`

**Checkpoint US1 (recipes list + detail)**: Navigate to `/recipes`. Verify page title, search placeholder, filter button, and empty state in Vietnamese. Open a recipe detail — verify all labels (Ingredients, Instructions, servings, cook time) in Vietnamese.

### Group B4 — Recipes Namespace, Form (US1 baseline)

- [X] T188 [P] [US1] Update `src/components/recipes/RecipeForm.tsx` — add `useTranslations('recipes')`, replace 15 hardcoded strings: all form labels (titleLabel, cookTimeLabel, servingsLabel, tagsLabel, ingredientsLabel, stepsLabel, photoLabel, photoHint), all placeholders (titlePlaceholder, namePlaceholder, qtyPlaceholder, unitPlaceholder), action buttons (addIngredient, addStep, saving, cancel), and 6 error messages (errors.titleRequired, errors.cookTimeInvalid, errors.servingsInvalid, errors.tagsRequired, errors.ingredientsRequired, errors.stepsRequired) with `t('form.*')` keys
- [X] T189 [P] [US1] Update `src/components/recipes/ImageUploadInput.tsx` — add `useTranslations('recipes')`, replace 3 hardcoded strings: photo label, photo hint, "Click to upload" text with `t('form.photoLabel')`, `t('form.photoHint')`, `t('form.clickToUpload')`

**Checkpoint US1 (recipe form)**: Navigate to `/recipes/new`. Verify all form labels, placeholders, and the "Add ingredient"/"Add step" buttons display in Vietnamese.

### Group B5 — Meal Planner Namespace (US1 baseline)

- [X] T190 [P] [US1] Update `src/app/meal-planner/page.tsx` — add `useTranslations('mealPlanner')`, replace 6 hardcoded strings: page title "Meal Planner", subtitle ICU (`{filled} of {total} slots filled`), "Clear week" button, clear-confirm dialog text, empty-state title and subtitle with `t('title')`, `t('subtitle', { filled, total })`, `t('clearWeek')`, `t('clearConfirm')`, `t('empty.*')` keys
- [X] T191 [P] [US1] Update `src/components/meal-planner/MealGrid.tsx` — add `useTranslations('mealPlanner')`, replace 10 hardcoded strings: 7 day abbreviations (Mon–Sun) and 3 meal slot labels (Breakfast, Lunch, Dinner) with `t('days.*')` and `t('meals.*')` keys
- [X] T192 [P] [US1] Update `src/components/meal-planner/RecipePicker.tsx` — add `useTranslations('recipes')`, replace 3 hardcoded strings: "Choose a recipe" heading, "No recipes found" empty state, servings ICU (`{n} servings`), search aria-label, close aria-label with `t('picker.*')` keys; pass `n` to servings ICU key
- [X] T193 [P] [US1] Update `src/components/meal-planner/WeekNavigator.tsx` — add `useTranslations('mealPlanner')`, replace 1 hardcoded string: "This week" label with `t('weekNav.thisWeek')`

**Checkpoint US1 (meal planner)**: Navigate to `/meal-planner`. Verify page title, subtitle slot count, day headers (Thứ 2–Chủ nhật), and meal row labels (Sáng, Trưa, Tối) are all in Vietnamese.

### Group B6 — Grocery List + Categories Namespaces (US1 baseline)

- [ ] T194 [P] [US1] Update `src/app/grocery-list/page.tsx` — add `useTranslations('groceryList')`, replace 8 hardcoded strings: page title, remaining items ICU (`{n} items remaining`), remainingOne singular, "Generate" button, "Regenerate" button, "Plan meals first" message, empty-state (noMeals title/subtitle/goToPlanner, noItems) with `t('groceryList.*')` keys; pass `n` to remaining ICU key
- [ ] T195 [P] [US1] Update `src/components/grocery/GroceryCategory.tsx` — add `useTranslations('categories')`, replace 6 hardcoded food category label strings by switching from `FOOD_CATEGORY_LABELS[category]` lookup to `t(category)` — the key names in `categories` namespace match the `FoodCategory` TypeScript union values exactly (vegetables_fruits, meat_fish, dairy_eggs, grains_bread, spices_seasonings, other)
- [ ] T196 [P] [US1] Update `src/components/grocery/AddManualItemForm.tsx` — add `useTranslations('groceryList')` and `useTranslations('categories')`, replace 6 hardcoded strings: "Add item" trigger button, form title, itemName label, qty label, unit label, "Add"/"Cancel" buttons with `t('addManual.*')` keys; also translate category select options using `useTranslations('categories')` with `t(category)` for each option

**Checkpoint US1 (grocery)**: Navigate to `/grocery-list`. Verify page title in Vietnamese, category section headers in Vietnamese (Rau củ & trái cây, Thịt & cá, etc.), and the Add Item form labels in Vietnamese.

### Group B7 — Nav + Not Found (US1 baseline)

- [X] T197 [P] [US1] Update `src/components/layout/Sidebar.tsx` — add `useTranslations('nav')`, replace 5 hardcoded nav label strings (Dashboard, Recipes, Meal Planner, Grocery List) and brand name with `t('nav.*')` keys; also replace `t('signOut')` for the logout area label (the LanguageSwitcher component will be added in T200 — leave a `{/* LanguageSwitcher */}` placeholder comment at the bottom of the sidebar nav for now)
- [X] T198 [P] [US1] Update `src/components/LogoutButton.tsx` — add `useTranslations('nav')`, replace 1 hardcoded string: "Sign out" button text with `t('signOut')`
- [X] T199 [P] [US1] Update `src/app/not-found.tsx` — add `useTranslations('notFound')`, replace 4 hardcoded strings: "Page not found" heading, description text, "Go home" link, "Browse recipes" link with `t('title')`, `t('description')`, `t('goHome')`, `t('browseRecipes')`

**Checkpoint**: Navigate the full app in Vietnamese (no `NEXT_LOCALE` cookie set). Every visible label on Login, Dashboard, Recipes (list + detail + form), Meal Planner, Grocery List pages and the Sidebar must be in Vietnamese. Zero English-only strings visible (SC-007, SC-001).

---

## Phase 38: LanguageSwitcher Component + Sidebar Integration (US2 + US3)

**Purpose**: Create the `LanguageSwitcher` component that calls the `setLocale` Server Action and triggers `router.refresh()` to re-render the app in the new locale without a page reload or URL change (FR-004, FR-009). Integrates into the Sidebar per research decision R-004. Delivers US2 and US3.

**⚠️ Depends on**: T167 (setLocale Server Action), T197 (Sidebar placeholder comment)

### User Story 2 — Switch Language to English (Priority: P2)

- [ ] T200 [US2] Create `src/components/LanguageSwitcher.tsx` as a `'use client'` component — import `useTranslations('nav')` for button labels, `useRouter` from `next/navigation`, and the `setLocale` Server Action from `src/app/actions/locale.ts`; render two buttons (one per locale) using `t('language.vi')` and `t('language.en')` as labels; on click, call `await setLocale(locale)` then `router.refresh()`; accept a `currentLocale: Locale` prop to visually mark the active language (bold or underline); mark the active locale button with `aria-current="true"` for accessibility (FR-002, FR-003, SC-002)
- [ ] T201 [US2] Update `src/components/layout/Sidebar.tsx` — remove the `{/* LanguageSwitcher */}` placeholder comment added in T197, import `LanguageSwitcher`, retrieve the current locale via `await getLocale()` from `next-intl/server` (Sidebar must be or call an async Server Component), and render `<LanguageSwitcher currentLocale={locale} />` at the bottom of the sidebar navigation area (FR-002: visible on every authenticated page)

**Checkpoint US2**: With the app in Vietnamese, click the "English" button in the sidebar. Verify all visible text on the current page switches to English immediately without a full page reload and without any URL change (SC-003, SC-006). Click "Tiếng Việt" — verify revert to Vietnamese.

### User Story 3 — Persistent Language Preference (Priority: P3)

Persistence is delivered by T167 (the Server Action writes a 1-year cookie). No additional implementation tasks are required. The cookie is set in Phase 34 via `setLocale()`, which already configures `maxAge: 31_536_000` (FR-005).

**Checkpoint US3**: Switch to English. Open a new browser tab (or close and reopen the browser). Navigate to the app. Verify it opens in English without any action from the user (SC-004).

---

## Phase 39: Fix Unit Tests Broken by Translation Changes

**Purpose**: Update existing Jest unit tests in `tests/unit/` that reference hardcoded strings now replaced by translation keys. No new tests are added — only broken tests are fixed.

**⚠️ Depends on**: All Phase 37 tasks (components updated) and Phase 38 (LanguageSwitcher created)

- [ ] T202 Run the full Jest test suite (`npm run test -- --passWithNoTests`) and capture a list of all failing tests caused by the i18n changes (component tests that assert on hardcoded strings that no longer exist, or tests that render components without a `NextIntlClientProvider` wrapper)
- [ ] T203 [P] For each failing test file identified in T202: wrap the component under test with a test-only `<NextIntlClientProvider locale="vi" messages={viMessages}>` provider (import `viMessages` from `messages/vi.json`), or use next-intl's `createTranslator` mock helper if available — update string assertions to match the Vietnamese translations from `messages/vi.json` (e.g., `expect(screen.getByText('Đăng nhập')).toBeInTheDocument()`)
- [ ] T204 Re-run `npm run test -- --passWithNoTests` — verify the test suite returns 0 failures; if regressions remain, investigate and fix them before proceeding to Phase 40

**Checkpoint**: `npm run test -- --passWithNoTests` exits with code 0.

---

## Phase 40: Polish, Validation, and Cross-Cutting Verification

**Purpose**: Confirm the full implementation is correct end-to-end — TypeScript compiles cleanly, the build succeeds, every page passes a Vietnamese-default visual check, all 3 user story acceptance criteria are met.

- [ ] T205 Run `npx tsc --noEmit` from project root — verify 0 TypeScript errors across all new and modified files (`src/i18n/*.ts`, `src/app/actions/locale.ts`, `src/components/LanguageSwitcher.tsx`, all 24 modified components); fix any type errors before proceeding
- [ ] T206 Run `npm run build` — verify the Next.js production build succeeds with 0 errors; confirm `createNextIntlPlugin` wrapper in `next.config.ts` is correctly applied and `messages/vi.json` and `messages/en.json` are included in the build output
- [ ] T207 [P] Open the app in a fresh browser profile (no `NEXT_LOCALE` cookie) and perform a full visual audit: navigate to Login, Signup, Dashboard, Recipes list, Recipe detail, Create Recipe form, Meal Planner, Grocery List — verify every visible UI string is in Vietnamese (SC-001, SC-007); record any English strings found and fix the corresponding translation task
- [ ] T208 [P] Using browser DevTools, clear all cookies and localStorage for localhost. Reload the app. Verify the `NEXT_LOCALE` cookie is absent and the app defaults to Vietnamese (FR-001). Then click "English" in the LanguageSwitcher — verify all text switches to English, the URL does not change (SC-006), no full page reload occurs (SC-003), and the `NEXT_LOCALE=en` cookie is now set (FR-005)
- [ ] T209 [P] Verify the fallback behavior: temporarily rename `messages/en.json` to `messages/en.json.bak`, set `NEXT_LOCALE=en`, reload the app — verify next-intl falls back to Vietnamese strings for missing keys rather than showing raw key paths (FR-008); restore `messages/en.json` afterward
- [ ] T210 Run `git diff --name-only` and confirm only expected files are new or modified: `messages/vi.json`, `messages/en.json`, `src/i18n/config.ts`, `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/app/actions/locale.ts`, `src/components/LanguageSwitcher.tsx`, `next.config.ts`, `src/app/layout.tsx`, and the 24 component/page files listed in plan.md — no accidental changes to `supabase/migrations/`, `src/services/`, or `src/context/`

**Checkpoint**: `tsc --noEmit` is clean, `npm run build` succeeds, all 3 User Story independent tests pass, zero English-only strings visible in Vietnamese mode, language switch works without page reload or URL change, preference persists across browser sessions.

---

## Dependencies Graph

```
T162 (install next-intl)
  └── T163, T164, T165, T166, T167 (infrastructure files) [parallel]
        └── T168–T175 (message bundles vi.json + en.json) [parallel within each]
              └── T176 (wire NextIntlClientProvider in layout)
                    └── T177–T199 (translate all 24 files) [all parallel]
                          └── T200, T201 (LanguageSwitcher + Sidebar integration)
                                └── T202–T204 (fix broken tests)
                                      └── T205–T210 (validation)
```

**US2 + US3 gate**: T200 and T201 depend on T167 (Server Action) and the message bundle keys `nav.language.*` from T168–T169.

---

## Parallel Execution Examples

### Phase 35 — Message Bundles (can run 2 agents simultaneously)
```
Agent A: T168+T169+T170+T171 → completes vi.json auth+nav+dashboard+recipes sections
Agent B: T173+T174+T175       → completes en.json auth+nav+dashboard+recipes+mealPlanner+groceryList+categories
```
(T172 finishes vi.json mealPlanner+groceryList+categories — run alongside Agent A/B)

### Phase 37 — Translation wiring (can run up to 7 agents simultaneously)
```
Agent A: T177, T178, T179 (auth pages)
Agent B: T180, T181, T182 (dashboard)
Agent C: T183, T184, T185, T186, T187 (recipes list + detail + filters + search)
Agent D: T188, T189 (recipe form + image upload)
Agent E: T190, T191, T192, T193 (meal planner)
Agent F: T194, T195, T196 (grocery + categories)
Agent G: T197, T198, T199 (nav + not-found)
```

---

## Implementation Strategy

**MVP scope** (minimum to satisfy US1 — Vietnamese default):
- Phase 34 (T162–T167) + Phase 35 (T168–T175) + Phase 36 (T176) + Phase 37 (T177–T199)
- This delivers FR-001, FR-006, FR-007, SC-001, SC-007 with no user interaction needed

**Increment 2** (adds US2 — language switch):
- Phase 38 (T200–T201)
- Adds FR-002, FR-003, FR-004, FR-009, SC-002, SC-003, SC-006

**Increment 3** (US3 is already covered by T167's cookie `maxAge` — no extra work):
- FR-005, SC-004 are satisfied by T167 which sets `maxAge: 31_536_000`

**Final**: Phase 39 (T202–T204) + Phase 40 (T205–T210) for stability and sign-off

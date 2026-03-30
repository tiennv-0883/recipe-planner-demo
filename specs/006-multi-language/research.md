# Research: Multi-Language Support (006)

**Phase**: 0 — Research  
**Branch**: `006-multi-language`  
**Date**: 2026-03-31

All four NEEDS CLARIFICATION items resolved below.

---

## R-001: next-intl Setup for Next.js 15 App Router WITHOUT Locale-Prefix URLs

**Decision**: Use `next-intl` v3+ with `localePrefix: 'never'` in routing config, combined with a custom `src/i18n/request.ts` that reads the `NEXT_LOCALE` cookie directly via `next/headers`.

**Rationale**:
- next-intl's `localePrefix: 'never'` routing mode is exactly designed for cookie-based locale without URL changes. No `/vi/` or `/en/` segments are ever added.
- `getRequestConfig` in `src/i18n/request.ts` reads from `cookies()` (Next.js server API) — no middleware changes required.
- The existing Supabase auth middleware continues to function unchanged.
- `NextIntlClientProvider` in the root layout passes all messages to client components via React context, enabling `useTranslations()` in any `'use client'` component.

**Alternatives considered**:
- URL-prefix routing (`/vi/...`): Rejected — violates FR-009 (no URL prefix).
- Manual React Context for translations: Rejected — reinvents what next-intl already provides with SSR support, TypeScript safety, and ICU message formatting.
- `next-i18next`: Rejected — designed for Pages Router, not App Router.

**Setup contract**:
```
messages/
  vi.json          ← default locale
  en.json
src/i18n/
  config.ts        ← locales + defaultLocale constants
  request.ts       ← getRequestConfig: reads NEXT_LOCALE cookie
  routing.ts       ← defineRouting({ locales, defaultLocale, localePrefix: 'never' })
next.config.ts     ← wrapped with createNextIntlPlugin('./src/i18n/request.ts')
src/app/layout.tsx ← async, wraps children with NextIntlClientProvider
```

---

## R-002: Hardcoded Strings Audit — All Components and Pages

**Decision**: 8 namespaces cover all in-scope UI text across 12 files.

**Complete file inventory** (files containing translatable strings):

| File | Namespace | Strings Count |
|------|-----------|--------------|
| `src/app/(auth)/layout.tsx` | `auth` | 2 |
| `src/app/(auth)/login/page.tsx` | `auth` | 9 |
| `src/app/(auth)/signup/page.tsx` | `auth` | 9 |
| `src/app/layout.tsx` | `common` | 1 |
| `src/app/page.tsx` | `dashboard` | 6 |
| `src/app/not-found.tsx` | `notFound` | 4 |
| `src/app/recipes/page.tsx` | `recipes` | 5 |
| `src/app/recipes/[id]/page.tsx` | `recipes` | 2 |
| `src/app/meal-planner/page.tsx` | `mealPlanner` | 6 |
| `src/app/grocery-list/page.tsx` | `groceryList` | 8 |
| `src/components/layout/Sidebar.tsx` | `nav` | 5 + 4 labels |
| `src/components/LogoutButton.tsx` | `nav` | 1 |
| `src/components/dashboard/WeekAtAGlance.tsx` | `dashboard` | 5 |
| `src/components/dashboard/RecentRecipes.tsx` | `dashboard` | 3 |
| `src/components/recipes/RecipeDetail.tsx` | `recipes` | 5 |
| `src/components/recipes/RecipeForm.tsx` | `recipes` | 15 |
| `src/components/recipes/RecipeFilters.tsx` | `recipes` | 2 |
| `src/components/recipes/RecipeSearch.tsx` | `recipes` | 2 |
| `src/components/recipes/ImageUploadInput.tsx` | `recipes` | 3 |
| `src/components/meal-planner/MealGrid.tsx` | `mealPlanner` | 10 (7 days + 3 meals) |
| `src/components/meal-planner/RecipePicker.tsx` | `recipes` | 3 |
| `src/components/meal-planner/WeekNavigator.tsx` | `mealPlanner` | 1 |
| `src/components/grocery/GroceryCategory.tsx` | `categories` | 6 labels |
| `src/components/grocery/AddManualItemForm.tsx` | `groceryList` | 6 |
| `src/data/categories.ts` | `categories` | 6 labels (migrated to JSON) |

**Note on `src/data/categories.ts`**: `FOOD_CATEGORY_LABELS` will be replaced by reading from the `categories` translation namespace. The constant itself remains but its values move to message bundles.

---

## R-003: Translation Namespace Structure — Nested vs Flat

**Decision**: **Nested** JSON structure with 8 domain namespaces.

**Rationale**:
- next-intl's `useTranslations('namespace')` hook is designed for nested namespaces — `t('form.titleLabel')` is cleaner than `t('recipes_form_titleLabel')`.
- Namespaces align with module boundaries (auth, nav, dashboard, recipes, mealPlanner, groceryList, categories, notFound, common), making it easy to parallelize translation work.
- TypeScript autocompletion works better with nested structure when using next-intl's type generation.

**Namespaces**:
| Namespace | Covers |
|-----------|--------|
| `auth` | Login, Signup pages, Auth layout tagline |
| `nav` | Sidebar labels, LogoutButton, language switcher labels |
| `dashboard` | Dashboard page, WeekAtAGlance, RecentRecipes |
| `recipes` | Recipes list, detail, form, image upload, search, picker |
| `mealPlanner` | Meal Planner page, MealGrid (days + meals), RecipePicker header, WeekNavigator |
| `groceryList` | Grocery List page, AddManualItemForm |
| `categories` | Food category labels (replaces FOOD_CATEGORY_LABELS constant values) |
| `notFound` | 404 page |
| `common` | Skip-to-content link and other truly shared one-off strings |

**Alternatives considered**:
- Flat namespace (`{ "auth_login_title": "..." }`): Rejected — loses semantic grouping, makes large JSON files unreadable.
- Per-component namespaces: Rejected — creates too many files (20+) for a small app; domain grouping is a better fit.
- Single flat file: Rejected — makes parallel translation work difficult and creates key collision risk.

---

## R-004: Language Switcher Placement and Persistence Mechanism

**Decision**: Switcher placed at the **bottom of the Sidebar**, stored in an **HTTP cookie** (`NEXT_LOCALE`, path `/`, maxAge 1 year) via a Next.js **Server Action**.

**Persistence mechanism** — Cookie vs localStorage:
- **Cookie chosen**: Unlike `localStorage`, cookies are readable server-side in `next/headers` (used by `src/i18n/request.ts`). This ensures SSR and the initial page load render in the correct locale, eliminating hydration mismatch.
- `localStorage` was rejected because it's read only on the client — the server would always render `vi`, then the client would switch, causing a visible flash.

**Cookie name**: `NEXT_LOCALE` — next-intl's conventional cookie name for backwards compatibility.

**Language switch flow**:
1. User clicks a language button in `LanguageSwitcher`.
2. Client calls Server Action `setLocale('en')`.
3. Server Action sets `NEXT_LOCALE=en` cookie (1-year maxAge, `sameSite: 'lax'`, `secure` in production).
4. Client calls `router.refresh()` from `next/navigation`.
5. Next.js App Router re-fetches all Server Components with the new cookie value.
6. `getRequestConfig` reads the new cookie → loads `messages/en.json`.
7. `NextIntlClientProvider` receives new messages → all `useTranslations()` hooks re-render with English strings.
8. **No full page reload**, no URL change. Satisfies FR-004 and FR-009.

**Placement rationale for Sidebar bottom**:
- The Sidebar is visible on every authenticated page (FR-002 equivalent for switcher).
- Bottom placement is a common pattern (avoids cluttering the navigation items).
- On auth pages (login/signup), the switcher is placed in the auth layout header since there is no sidebar.

**Fallback behavior**:
- Missing or unrecognized `NEXT_LOCALE` cookie → falls back to `'vi'` (FR-001, FR-008).
- Private/incognito: cookies are still writable per session; default `'vi'` is used. No error shown (edge case in spec).

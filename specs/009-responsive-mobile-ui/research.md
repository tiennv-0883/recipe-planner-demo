# Research: 009-responsive-mobile-ui

**Date**: 2026-03-31  
**Branch**: `009-responsive-mobile-ui`

---

## 1. Navigation Pattern: Bottom Nav Bar vs Hamburger Menu

**Decision**: Fixed bottom navigation bar on mobile (< 640px).

**Rationale**:
- Explicitly mandated by FR-001 and FR-002 in the spec.
- 5 navigation destinations fits the bottom-tab bar pattern perfectly (Google Material Design and Apple HIG both designate this as the correct pattern for 2–5 destinations).
- Hamburger menus require an extra tap to reveal and hide navigation — bottom nav provides persistent one-tap access to all sections.
- Thumb-zone accessibility: bottom-of-screen elements are naturally reachable on modern phones held in one hand.

**Alternatives considered**:
- Hamburger (slide-out drawer): rejected — extra tap overhead; spec explicitly requires bottom nav.
- Top navigation bar with overflow: rejected — not touch-optimised for large phones.

---

## 2. Breakpoint at Which Sidebar Replaces Bottom Nav

**Decision**: Sidebar visible at ≥ 640px (`sm:`), bottom nav visible at < 640px.

**Rationale**:
- FR-001: bottom nav on screens narrower than 640px.
- FR-002: sidebar hidden on screens narrower than 640px.
- Spec assumption: "sidebar is assumed to remain visible at tablet size".
- This means the range 640px–1023px retains the sidebar — consistent with the existing 240px sidebar layout.

**Tailwind implementation**:
- Sidebar: `hidden sm:flex` (hidden below 640px, flex column above).
- BottomNav: `flex sm:hidden fixed bottom-0 inset-x-0` (visible only on mobile).
- Main content padding-left: `pl-0 sm:pl-60`.
- Main content padding-bottom: `pb-20 sm:pb-0` (clears bottom nav on mobile).

---

## 3. MealGrid: Table vs. Stacked Card Layout

**Decision**: CSS-only dual render — a stacked day-card view (`sm:hidden`) alongside the existing table (`hidden sm:block`). No JavaScript media query hook.

**Rationale**:
- `MealGrid.tsx` currently uses `<table className="... min-w-[640px]">` inside `overflow-x-auto`. This causes horizontal scrolling on narrow screens, violating FR-009 and FR-014.
- A React media-query hook (`useMediaQuery`) causes SSR hydration mismatch and CLS.
- CSS-only dual render (`sm:hidden` / `hidden sm:block` wrapper divs) avoids hydration issues and keeps the existing desktop table code untouched.
- The mobile view renders each day as a collapsible card (`<details>`) or an accordion row showing its 3 meal-type slots vertically. This maps directly to US3 acceptance scenario 1: "presented as a single-column, vertically stacked list of days".

**Chosen mobile layout for MealGrid**:
- One `<div>` per day, showing day name as heading.
- Three rows inside each day card for Breakfast / Lunch / Dinner.
- Same slot interaction (add/remove recipe) reused via the existing `onAddRecipe` / `onRemoveRecipe` callbacks.

---

## 4. Touch Target Size: 44px Minimum

**Decision**: Apply `min-h-[44px] min-w-[44px]` to all interactive elements on mobile. For inline icon buttons, add padding to make the hit area larger without changing visual size.

**Rationale**:
- WCAG 2.5.5 (Level AAA) recommends 44×44 CSS pixels.
- Apple HIG mandates 44pt tap targets.
- FR-005 and SC-003 in spec require 44×44px for every interactive element.

**Files with tap-target violations (audited)**:

| Component | Element | Current Size | Fix |
|---|---|---|---|
| `GroceryCategory.tsx` | Checkbox (`h-4 w-4`) | 16px | Wrap in `<label>` with `min-h-[44px] flex items-center` |
| `GroceryCategory.tsx` | Remove button (`w-4 h-4`) | 16px | Add `p-2.5 -m-2.5` to expand hit area |
| `CatalogCard.tsx` | Edit / Delete buttons | ~32px | Add `min-h-[44px] px-3` |
| `WeekNavigator.tsx` | Prev/Next arrow buttons (`p-2`, `w-4 h-4`) | ~32px | Change to `p-3` (48px) |
| `AddManualItemForm.tsx` | Toggle trigger button (text link style) | ~20px | Add `min-h-[44px] flex items-center` |
| `(auth)/login` & `signup` | Submit button (`py-2.5` ≈ 40px) | 40px | Change to `py-3` (48px) |
| `BottomNav.tsx` (new) | Each tab button | Must be ≥44px | Set `min-h-[56px]` for comfortable iOS spacing |

---

## 5. Safe Area Insets (iPhone Home Indicator)

**Decision**: Add `pb-safe` via CSS `env(safe-area-inset-bottom)` to the bottom nav container.

**Rationale**:
- iPhones without a home button use a swipe-up gesture area at the bottom; the system safe area can be 20–34px. Without inset handling, the bottom nav sits behind the home indicator.
- Implementation: on `BottomNav` wrapper, add `style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}` or use the Tailwind `pb-safe` plugin if available; fall back to a `pb-2` minimum.
- Requires `<meta name="viewport" content="...viewport-fit=cover">` in `app/layout.tsx` for `env(safe-area-inset-bottom)` to work.

**Alternative**: Use a static `pb-6` on the bottom nav footer — simpler but wastes space on non-notch phones.

---

## 6. RecipeGrid Mobile Columns

**Decision**: Change `sm:grid-cols-2` to `md:grid-cols-2` in `RecipeGrid.tsx` to align with FR-007 (2-column at ≥768px).

**Rationale**:
- FR-007: "recipe cards displayed in a 2-column grid at ≥768px" (=`md:` breakpoint).
- RecipeGrid.tsx currently has `sm:grid-cols-2` (≥640px). On a 640px screen (tablet portrait), 2 columns are quite narrow. The spec intends 2 columns only from 768px.
- RecipeList.tsx usage of `RecipeGrid.tsx` (or its inline grid) should be verified to apply `md:grid-cols-2` not `sm:grid-cols-2`.

---

## 7. Auth Layout Mobile Padding

**Decision**: Change the inner card padding from `p-8` to `px-6 py-8 sm:p-8` in `(auth)/layout.tsx`.

**Rationale**:
- At 320px viewport, `max-w-md` container is full-width. Inner card `p-8` = 32px padding on each side, leaving only 256px for content — acceptable, but form fields with `px-3` text inputs may be tight.
- More importantly, `p-8` on a 320px screen = 2×32 = 64px consumed by padding, leaving 256px content width. This is workable, but `p-6` at mobile (2×24=48px) is more comfortable.

---

## 8. Logout Button Placement on Mobile

**Decision**: Defer logout to a standalone button within a top-right header icon, or keep it accessible via the profile/settings area of the app. For Phase 1 scope, include it as a secondary tab in `BottomNav` (rightmost position) labeled with a user-profile icon, which navigates to a profile/settings page if one exists, otherwise shows a mini-modal with logout only.

**Rationale**:
- The spec assumption explicitly defers this: "Its placement on mobile is deferred to implementation."
- Simplest safe approach: add a sixth "Account" icon to the bottom nav that shows a small popover/sheet with the LogoutButton. This avoids a new page route.
- Since the app currently has no profile page, the "Account" tab opens an overlay, not a route. This is within scope as a layout-layer change.

**Alternatives considered**:
- Embed logout in a hamburger-style overflow menu — rejected (no hamburger menu in this design).
- Move logout to a top fixed header bar — adds visual complexity; rejected.
- Add a 6th tab icon for "Account" — chosen (keeps all actions accessible from bottom nav).

---

## 9. Existing i18n / Translation Keys

**Decision**: No new translation keys required. All BottomNav labels reuse `nav.*` keys already defined in `messages/vi.json` and `messages/en.json`.

**Rationale**:
- `Sidebar.tsx` already reads `t('nav.dashboard')`, `t('nav.recipes')`, etc.
- `BottomNav.tsx` should use the same `useTranslations('nav')` and the same `labelKey` values — zero new translation strings needed.

---

## 10. File Impact Summary

| File | Change Type | Reason |
|---|---|---|
| `src/components/layout/BottomNav.tsx` | **NEW** | Mobile nav bar (FR-001, FR-003) |
| `src/components/layout/MainLayout.tsx` | Modify | Responsive pl-0/pl-60, pb-20/0 (FR-002, FR-013) |
| `src/components/layout/Sidebar.tsx` | Modify | `hidden sm:flex` (FR-002) |
| `src/components/meal-planner/MealGrid.tsx` | Modify | Mobile stacked day layout (FR-009) |
| `src/components/recipes/RecipeGrid.tsx` | Modify | `md:grid-cols-2` instead of `sm:grid-cols-2` (FR-007) |
| `src/components/recipes/RecipeDetail.tsx` | Modify | Stack header action buttons on mobile |
| `src/components/grocery/GroceryCategory.tsx` | Modify | Tap target fixes (FR-005) |
| `src/components/grocery/AddManualItemForm.tsx` | Modify | Toggle button tap target (FR-005) |
| `src/components/catalog/CatalogCard.tsx` | Modify | Edit/Delete button tap targets (FR-005) |
| `src/components/meal-planner/WeekNavigator.tsx` | Modify | `p-3` on prev/next buttons (FR-005) |
| `src/app/(auth)/layout.tsx` | Modify | Mobile card padding (FR-012) |
| `src/app/(auth)/login/page.tsx` | Modify | Submit button `py-3` min 44px (FR-005, FR-012) |
| `src/app/(auth)/signup/page.tsx` | Modify | Submit button `py-3` min 44px (FR-005, FR-012) |
| `src/app/layout.tsx` | Modify | Add `viewport-fit=cover` meta (safe area support) |
| `tests/e2e/responsive-mobile.spec.ts` | **NEW** | Playwright tests for US1–US5 (Principle III TDD gate) |

**Not changed** (confirmed no modification needed):
- All service files (`services/`), contexts (`context/`), types (`types/`), API routes (`api/`), data files (`data/`), i18n config  
- `WeekAtAGlance.tsx` — `space-y-2` row list already stacks vertically; fine on mobile  
- `RecentRecipes.tsx` — uses card grid, inherits responsive classes  
- `RecipeSearch.tsx` — likely `w-full` based on usage; not a layout file  
- `RecipeList.tsx` — delegates to `RecipeGrid.tsx` for grid mode (verify during impl)

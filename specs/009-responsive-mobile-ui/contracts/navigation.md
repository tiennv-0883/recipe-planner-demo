# UI Contract: Navigation

**Spec**: 009-responsive-mobile-ui  
**Date**: 2026-03-31

This contract defines the public interface of the two navigation components that serve the
same 5 destinations — `Sidebar.tsx` on ≥640px and `BottomNav.tsx` on <640px.

---

## `BottomNav` Component

**File**: `src/components/layout/BottomNav.tsx`  
**Visibility**: Used only inside `MainLayout.tsx` (internal component — no direct page usage)

### Props

```typescript
// No external props — fully self-contained
export default function BottomNav(): JSX.Element
```

### Behaviour Contract

| Rule | Detail |
|---|---|
| Visibility | `flex sm:hidden` — rendered in DOM on all sizes, visible only below 640px via CSS |
| Position | `fixed bottom-0 inset-x-0 z-30` — same z-level as Sidebar |
| Height | `min-h-[56px]` inner tabs; outer container adds `pb-safe` for safe-area |
| Active state | `usePathname()` determines active tab; exact match for `/`, prefix match for all others |
| Active indicator | Active tab icon + label receive brand colour (`text-brand-600`); inactive = `text-gray-500` |
| Tap targets | Each tab button: `flex-1 flex flex-col items-center py-2 min-h-[56px]` (≥44px) |
| Icons | Same SVG paths reused from `Sidebar.tsx` — `w-6 h-6` (was `w-5 h-5` in sidebar) |
| Labels | Short labels only; same `t(item.labelKey)` as sidebar but truncated at 8 chars if needed |
| Account tab | 6th element (far right); `onPress` opens an inline overlay `<div>` with `LogoutButton`; does NOT navigate |
| Keyboard | Each tab is a `<Link>` (or `<button>` for Account); receives `focus:outline-none focus:ring-2` |
| ARIA | `<nav aria-label="Mobile navigation">`; active link has `aria-current="page"` |

### Visual Layout

```
[ Dashboard | Recipes | Meal Plan | Grocery | Catalog | Account ]
   ^icon        ^icon     ^icon       ^icon     ^icon     ^icon
   ^label       ^label    ^label      ^label    ^label    ^label
```

Each slot: `flex-1` — equal width distribution across the full viewport.

---

## `Sidebar` Component (existing — stability contract)

**File**: `src/components/layout/Sidebar.tsx`  
**Change**: Add `hidden sm:flex` to the `<aside>` root element.

### Stability Rules

The following must NOT change in this feature:

- The `NAV_ITEMS` array (href, labelKey, icon) — these are the source of truth.
- The active-state logic (`pathname === '/'` or `pathname.startsWith(item.href)`).
- The `LogoutButton` in the sidebar footer — remains unchanged on ≥640px.
- The `z-30` stacking context.

---

## `MainLayout` Component (existing — stability contract)

**File**: `src/components/layout/MainLayout.tsx`

### Change Summary

```typescript
// Before
<div className="min-h-screen bg-gray-50">
  <Sidebar />
  <div className="pl-60">
    <main className="min-h-screen px-6 py-8" id="main-content">
      {children}
    </main>
  </div>
</div>

// After
<div className="min-h-screen bg-gray-50">
  <Sidebar />           {/* hidden on mobile via sm:flex inside Sidebar */}
  <BottomNav />         {/* NEW — flex sm:hidden inside BottomNav */}
  <div className="sm:pl-60">
    <main
      className="min-h-screen px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-8"
      id="main-content"
    >
      {children}
    </main>
  </div>
</div>
```

`pb-24` (96px) clears the 56px bottom nav + safe area + breathing room on mobile.

---

## Breaking Change Risk: NONE

- `MainLayout` is an internal component. No external callers pass navigation props.
- `Sidebar` and `BottomNav` are co-located under `components/layout/` and not exported
  at the package level.
- All 6 page files that consume `MainLayout` (`page.tsx`, `recipes/page.tsx`,
  `recipes/[id]/page.tsx`, `meal-planner/page.tsx`, `grocery-list/page.tsx`,
  `ingredient-catalog/page.tsx`) retain exactly the same usage signature:
  `<MainLayout>{children}</MainLayout>`.

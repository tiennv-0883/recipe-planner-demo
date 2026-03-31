# Implementation Plan: 009-responsive-mobile-ui

**Branch**: `009-responsive-mobile-ui` | **Date**: 2026-03-31 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/009-responsive-mobile-ui/spec.md`

## Summary

Make the entire Recipe Planner app fully responsive for mobile screens (< 640px). The primary
change is replacing the fixed sidebar with a fixed bottom navigation bar on mobile, while
keeping the sidebar intact on tablet/desktop (≥640px). Secondary work covers 13 component
files that need responsive Tailwind classes, tap-target fixes (minimum 44px), and a
mobile-friendly vertical stack for the Meal Planner grid. No changes to business logic,
data services, context, or type definitions.

## Technical Context

**Language/Version**: TypeScript 5.x · React 18 · Next.js 14 (App Router)  
**Primary Dependencies**: Tailwind CSS v3 · next-intl 3.x · clsx · Playwright (e2e)  
**Storage**: N/A (layout-only; no schema changes)  
**Testing**: Playwright (e2e acceptance tests per US1–US5) · Jest (no new unit tests needed)  
**Target Platform**: Web browser — mobile 320–639px / tablet 640–1023px / desktop ≥1024px  
**Project Type**: Web application (Next.js App Router, single monorepo)  
**Performance Goals**: Zero layout shift (CLS ≈ 0); no FOUC on sidebar/BottomNav toggle  
**Constraints**: No changes to business logic, data layer, state management, or type defs  
**Scale/Scope**: 1 new component + 13 modified files; 0 new API routes; 0 schema changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| **I — Module Cohesion** | ✅ PASS | Layout-only; no cross-module data dependency introduced |
| **II — Recipe as SSOT** | ✅ PASS | No recipe data flow, services, or state modified |
| **III — TDD (NON-NEGOTIABLE)** | ✅ MITIGATED | Pure CSS/layout feature; unit-testable logic is minimal. Playwright e2e tests for all 5 acceptance scenarios MUST be written and committed (red) before any component is modified. See complexity note below. |
| **IV — YAGNI** | ✅ PASS | Every changed file traces directly to a numbered requirement (FR-001–FR-016) |
| **V — Data Integrity** | ✅ PASS | No schema changes; no migration needed |

**Post-design re-check** (after Phase 1): PASS — design introduces no new violations.

## Project Structure

### Documentation (this feature)

```text
specs/009-responsive-mobile-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output — all decisions resolved
├── data-model.md        # Phase 1 output — component interface shapes
├── quickstart.md        # Phase 1 output — implementation sequence
├── contracts/
│   └── navigation.md    # Phase 1 output — BottomNav + MainLayout contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code Changes

```text
src/components/layout/
├── BottomNav.tsx           # NEW — fixed bottom nav bar, visible only below sm: (< 640px)
├── MainLayout.tsx          # MODIFY — sm:pl-60, mobile bottom padding pb-24
└── Sidebar.tsx             # MODIFY — hidden sm:flex (hide on mobile)

src/components/meal-planner/
└── MealGrid.tsx            # MODIFY — mobile: stacked day cards (hidden sm:block table)

src/components/recipes/
├── RecipeGrid.tsx          # MODIFY — md:grid-cols-2 (was sm:grid-cols-2)
└── RecipeDetail.tsx        # MODIFY — flex-col header actions on mobile

src/components/grocery/
└── GroceryCategory.tsx     # MODIFY — 44px tap targets on checkbox + remove button

src/components/grocery/
└── AddManualItemForm.tsx    # MODIFY — toggle trigger min-h-[44px]

src/components/catalog/
└── CatalogCard.tsx         # MODIFY — edit/delete button min-h-[44px]

src/components/meal-planner/
└── WeekNavigator.tsx       # MODIFY — p-3 prev/next buttons (was p-2)

src/app/(auth)/
└── layout.tsx              # MODIFY — p-6 sm:p-8 card padding

src/app/(auth)/login/
└── page.tsx                # MODIFY — submit button py-3 (min 44px)

src/app/(auth)/signup/
└── page.tsx                # MODIFY — submit button py-3 (min 44px)

src/app/
└── layout.tsx              # MODIFY — viewport-fit=cover for safe area

tests/e2e/
└── responsive-mobile.spec.ts  # NEW — Playwright tests for US1–US5 (TDD gate)
```

**Structure Decision**: Single Next.js App Router project. All layout changes are in
`src/components/layout/` and individual page components. No new routes, no new pages,
no new API endpoints.

## Complexity Tracking

> **Principle III TDD mitigation (documented here per gate requirement):**
>
> This is a pure layout feature. No algorithmic business logic is introduced — the sole
> conditional logic is the active-tab resolver in `BottomNav.tsx` (identical to the
> existing logic in `Sidebar.tsx`, which is already tested via Playwright e2e). Writing
> unit tests for CSS class toggling would be testing Tailwind, not application logic.
>
> The project constitution requires "tests MUST be written and approved before
> implementation begins." For layout features, this is satisfied by:
> 1. Playwright e2e tests covering every acceptance scenario from US1–US5.
> 2. Tests committed and run (all failing = red) before the first component modification.
> 3. Implementation proceeds step-by-step until all tests pass (green).
>
> This mirrors the Red → Green → Refactor cycle applied to UI work.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

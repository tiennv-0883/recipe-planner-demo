# Feature Specification: Responsive Mobile UI

**Feature Branch**: `009-responsive-mobile-ui`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "Make the entire Recipe Planner app fully responsive and mobile-friendly. Requirements: Support mobile screens (< 640px) for all pages. Sidebar navigation → replace with bottom navigation bar on mobile. All pages must be responsive: Recipes list, Recipe Detail, Meal Plan, Grocery List, Ingredient Catalog, Auth (login/register). Use mobile-first breakpoints: base (mobile), sm: (≥640px), md: (≥768px), lg: (≥1024px) with Tailwind CSS. No changes to business logic or data layer — layout and UI only. Touch-friendly targets (minimum 44px tap targets). Vietnamese is the primary language."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate the App on a Mobile Phone (Priority: P1)

A user opens the Recipe Planner on their phone (screen width under 640px). They see a clean, full-width layout with no sidebar. At the bottom of the screen, a fixed navigation bar shows icons for: Dashboard, Recipes, Meal Planner, Grocery List, and Ingredient Catalog. The user taps each icon to move between sections.

**Why this priority**: Navigation is foundational — without usable navigation on mobile, every other page is inaccessible. This story unblocks all other mobile user flows.

**Independent Test**: Open the app on a device or browser emulator at 375px wide. Verify the sidebar is hidden, the bottom navigation bar is visible and fixed, all 5 navigation icons are present, tap targets are large enough to tap comfortably, and each tap navigates to the correct page.

**Acceptance Scenarios**:

1. **Given** a user opens the app on a mobile screen, **When** the page loads, **Then** no sidebar is visible and a bottom navigation bar is shown at the bottom of the viewport.
2. **Given** a bottom navigation bar is visible, **When** the user taps any navigation icon, **Then** the user is taken to the correct page and the active icon is visually highlighted.
3. **Given** a desktop screen (≥1024px), **When** the page loads, **Then** the sidebar remains visible and the bottom navigation bar is hidden.
4. **Given** any navigation icon, **When** measured in pixels, **Then** the tap target area is at least 44×44 pixels.

---

### User Story 2 - Browse and Search Recipes on Mobile (Priority: P2)

A user on a mobile phone navigates to the Recipes list page. They see a single-column list of recipe cards that fills the full screen width. Each card shows the recipe image, name, and key info. The user taps a recipe card and is taken to the Recipe Detail page with a readable, single-column layout — sections (ingredients, steps, metadata) are stacked vertically.

**Why this priority**: Recipes are the core content of the app. Making the recipes list and detail pages mobile-friendly directly delivers value to a mobile user.

**Independent Test**: At 375px viewport width, load the Recipes page and verify cards are full-width and readable. Tap a recipe and verify the detail page is single-column with no horizontal scroll and all content is visible.

**Acceptance Scenarios**:

1. **Given** a mobile screen, **When** the user opens the Recipes page, **Then** recipe cards are displayed in a single full-width column with no horizontal overflow.
2. **Given** a recipe card is displayed, **When** the user taps it, **Then** the Recipe Detail page opens with content stacked in a single column.
3. **Given** the Recipe Detail page, **When** viewed at 375px, **Then** all sections (image, title, ingredients, steps) are readable without horizontal scrolling.
4. **Given** a tablet screen (≥768px), **When** the user opens the Recipes page, **Then** recipe cards are arranged in a 2-column grid.

---

### User Story 3 - Use the Meal Planner on Mobile (Priority: P3)

A user on a phone opens the Meal Planner. The weekly plan is presented in a format that works on a narrow screen — either a vertically stacked day-by-day view or a horizontally swipeable layout. The user can see each day's meals and interact with meal slots using touch-friendly controls.

**Why this priority**: The meal planner involves a complex multi-column grid that requires dedicated mobile layout work to remain usable.

**Independent Test**: At 375px viewport width, load the Meal Planner and verify that all 7 days and all meal slots are accessible without requiring horizontal scrolling of the page. Confirmed tap targets meet the 44px minimum.

**Acceptance Scenarios**:

1. **Given** a mobile screen, **When** the Meal Planner is opened, **Then** the weekly view is presented as a single-column, vertically stacked list of days rather than a multi-column grid.
2. **Given** a day in the meal planner, **When** the user taps a meal slot, **Then** the add/edit interaction is accessible and usable on touch.
3. **Given** a desktop screen (≥1024px), **When** the meal planner is opened, **Then** the original multi-column grid layout is preserved.

---

### User Story 4 - Manage Grocery List and Ingredient Catalog on Mobile (Priority: P4)

A user on a phone opens the Grocery List and the Ingredient Catalog. Both pages render in a readable single-column format. List items are large enough to tap. Action buttons (add, check off, delete) are touch-friendly. Forms for adding items are full-width and easy to use on a soft keyboard.

**Why this priority**: These are task-oriented pages where touch usability directly affects completion rates.

**Independent Test**: At 375px, open both pages and verify items render in a readable single-column layout, all action buttons meet the 44px tap target size, and input forms are full-width without overflowing.

**Acceptance Scenarios**:

1. **Given** a mobile screen, **When** the Grocery List is opened, **Then** all items are displayed in a single-column, full-width list.
2. **Given** a grocery list item, **When** the user taps the check or delete action, **Then** the action triggers correctly with a tap area of at least 44×44 pixels.
3. **Given** the Ingredient Catalog on mobile, **When** the user views items, **Then** the layout is single-column and all catalog entry controls are touch-accessible.

---

### User Story 5 - Log In and Register on Mobile (Priority: P5)

A user on a phone opens the login or registration page. The form is centered, full-width, and easy to fill out on a mobile keyboard. Buttons are large and clearly labeled. No content is cut off or overlapping.

**Why this priority**: Authentication is a required first step. While less visually complex, it must work on mobile.

**Independent Test**: At 375px, open the login page and verify the form fields and submit button are full-width, touch-accessible, and no elements overflow the viewport.

**Acceptance Scenarios**:

1. **Given** a mobile screen, **When** the login page is opened, **Then** the form is displayed in a single-column, full-width layout centered on screen.
2. **Given** the registration page on mobile, **When** the user fills in fields, **Then** input labels and fields do not overlap and are spaced adequately.
3. **Given** any auth page on mobile, **When** the submit button is measured, **Then** it has a minimum height of 44px and full-width.

---

### Edge Cases

- What happens when a user rotates their device from portrait to landscape? The layout should gracefully adapt across breakpoints without broken rendering.
- What happens if the bottom navigation bar overlaps page content at the bottom? Page content must include sufficient bottom padding so items near the bottom of the viewport are not hidden behind the navigation bar.
- What happens on very small screens (e.g., 320px wide)? All content must still be readable with no horizontal scroll.
- What happens with long recipe names or ingredient names? Text must wrap or truncate gracefully without overflowing its container.
- What happens when a modal or dialog opens on mobile? The modal must be readable and closeable without requiring a sidebar to be visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display a fixed bottom navigation bar on screens narrower than 640px, replacing the sidebar navigation.
- **FR-002**: The sidebar navigation MUST be hidden on screens narrower than 640px.
- **FR-003**: The bottom navigation bar MUST include all 5 navigation destinations: Dashboard, Recipes, Meal Planner, Grocery List, and Ingredient Catalog.
- **FR-004**: The active navigation destination MUST be visually distinguished in the bottom navigation bar at all times (e.g., highlighted icon or label).
- **FR-005**: Every interactive element (button, link, icon, form control) MUST have a minimum tap target size of 44×44 pixels.
- **FR-006**: All pages MUST use a mobile-first layout: single-column at base (mobile), adapting to multi-column at sm (≥640px), md (≥768px), and lg (≥1024px) breakpoints.
- **FR-007**: The Recipes list page MUST display recipe cards in a 1-column layout on mobile and a 2-column grid at ≥768px.
- **FR-008**: The Recipe Detail page MUST display all sections (image, title, ingredients, preparation steps) in a single column on mobile.
- **FR-009**: The Meal Planner MUST present days stacked vertically (one day per row) on mobile instead of the desktop multi-column grid.
- **FR-010**: The Grocery List page MUST display list items in a full-width single column on mobile with touch-accessible action controls.
- **FR-011**: The Ingredient Catalog page MUST display catalog entries in a single column on mobile with touch-accessible controls.
- **FR-012**: All authentication pages (login, register) MUST display full-width, single-column forms with touch-accessible submit buttons.
- **FR-013**: Page content MUST include bottom padding sufficient to prevent content from being obscured by the bottom navigation bar on mobile.
- **FR-014**: No page MUST require horizontal scrolling on any supported screen size.
- **FR-015**: The desktop sidebar layout MUST be preserved unchanged on screens ≥1024px.
- **FR-016**: No changes MUST be made to business logic, data services, state management, or data models.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 app sections (Dashboard, Recipes, Recipe Detail, Meal Planner, Grocery List, Ingredient Catalog, Auth) render without horizontal overflow at 375px viewport width.
- **SC-002**: A user can navigate to any section of the app using only the bottom navigation bar on a 375px screen, completing the full round-trip in under 10 seconds.
- **SC-003**: Every interactive element on mobile screens passes a tap-target audit with a minimum size of 44×44 pixels.
- **SC-004**: The desktop layout (sidebar + content) is visually identical to the pre-feature baseline when viewed at ≥1024px viewport width.
- **SC-005**: All pages produce zero horizontal scroll at 320px, 375px, 390px, and 428px viewport widths.
- **SC-006**: The mobile bottom navigation bar is visible and correctly highlights the active page across all 5 navigation destinations.
- **SC-007**: A user on a mobile phone can complete a primary task (e.g., view a recipe detail, check off a grocery item, view a meal plan day) with no more than 3 taps from the home screen.

## Assumptions

- The existing sidebar navigation (5 items: Dashboard, Recipes, Meal Planner, Grocery List, Ingredient Catalog) is the source of truth for the bottom navigation bar items and order.
- The bottom navigation bar shows icons with labels on mobile; icon-only display is acceptable if labels cause layout crowding at very small widths.
- The desktop experience (sidebar layout) begins at ≥1024px. The range 640px–1023px (tablet) may use a condensed sidebar or the bottom nav; the sidebar is assumed to remain visible at tablet size unless the user specifies otherwise.
- "No changes to business logic or data layer" means no modifications to: server actions, Supabase calls, context/state management, type definitions, or seed data.
- Existing Vietnamese translations already in place (via next-intl) do not require changes as part of this feature.
- The logout button, currently part of the sidebar, will also appear in the bottom navigation area (e.g., as a profile/settings icon) or in a page header — its placement on mobile is deferred to implementation.

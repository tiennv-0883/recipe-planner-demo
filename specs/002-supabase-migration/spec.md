# Feature Specification: Supabase Backend Migration

**Feature Branch**: `002-supabase-migration`
**Created**: 2026-03-14
**Status**: Draft
**Input**: Migrate toan bo data layer tu localStorage + mock data sang Supabase bao gom Auth, PostgreSQL, API Routes, va Deploy Vercel.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 -- Account Registration & Login (Priority: P1)

A new user opens the app for the first time. They see a welcome screen with "Sign up" and
"Log in" options. They register with email and password and gain access to their personal
recipe collection. On subsequent visits they log in and see only their own data.

**Why this priority**: Without authentication, all other cloud features are meaningless.
This is the entry gate to every other user story.

**Independent Test**: Open the app in an incognito window. Register with a new email.
Log in with those credentials from a different browser -- the same account appears.
Log out -- the app returns to the welcome screen and no personal data is visible.

**Acceptance Scenarios**:

1. **Given** the user has no account, **When** they register with a valid email and
   password (min 8 chars), **Then** their account is created and they are redirected
   to the Dashboard.
2. **Given** the user has an existing account, **When** they log in with correct
   credentials, **Then** they are redirected to the Dashboard with their personal
   data loaded.
3. **Given** the user submits an invalid email or short password, **When** they
   attempt to register, **Then** inline validation messages appear and the form is
   not submitted.
4. **Given** the user is logged in, **When** they click "Log out", **Then** they are
   returned to the login screen and their session is cleared.
5. **Given** the user enters wrong credentials, **When** they attempt to log in,
   **Then** an error message is shown without revealing which field is incorrect.

---

### User Story 2 -- Personal Recipe Collection Persists Across Devices (Priority: P2)

A logged-in user creates, edits, and deletes recipes on their laptop. They then open the
app on their phone -- the same recipes appear with all changes intact. Their data never
disappears when they clear the browser.

**Why this priority**: Persistent cloud storage is the core value over the current
localStorage approach.

**Independent Test**: Create two new recipes on one device. Open the app on a different
device with the same account -- both recipes appear. Delete one recipe on the second
device, reload the first device -- the deleted recipe is gone.

**Acceptance Scenarios**:

1. **Given** a logged-in user creates a recipe on Device A, **When** they open the app
   on Device B, **Then** the recipe is visible within 5 seconds of page load.
2. **Given** a logged-in user edits a recipe's ingredients, **When** they reload the
   page, **Then** the updated ingredients are shown (not the previous version).
3. **Given** a logged-in user deletes a recipe, **When** they reload or switch devices,
   **Then** the deleted recipe does not appear in the recipe list.
4. **Given** the user clears browser localStorage, **When** they log in again, **Then**
   all their recipes are still available from the cloud.

---

### User Story 3 -- Meal Plan & Grocery List Persist Across Devices (Priority: P3)

A logged-in user assigns recipes to their weekly meal plan on their laptop. They check
their grocery list on their phone while shopping -- the list reflects exactly what they
planned.

**Why this priority**: Meal plan and grocery list are the primary value features; they
must work reliably across devices now that auth exists.

**Independent Test**: Assign 3 recipes to different slots in the current week. Open the
grocery list on a different device -- the correct aggregated ingredients appear.
Check off an item on the phone -- reload on the laptop -- the item remains checked.

**Acceptance Scenarios**:

1. **Given** a user assigns a recipe to Monday Breakfast on Device A, **When** they
   open Meal Planner on Device B, **Then** Monday Breakfast shows the correct recipe.
2. **Given** a user generates a grocery list from their meal plan, **When** they reload
   on any device, **Then** the grocery list shows the same items.
3. **Given** a user checks off a grocery item on one device, **When** they reload on
   another device, **Then** the item appears checked.
4. **Given** the user navigates to a previous week, **When** they view the meal plan,
   **Then** the correct plan for that week is shown (not the current week's plan).

---

### User Story 4 -- Data Privacy: Each User Sees Only Their Own Data (Priority: P1)

Two different users can use the app simultaneously. User A cannot see, access, or modify
User B's recipes, meal plans, or grocery lists.

**Why this priority**: Privacy and data isolation are mandatory for any multi-user system.
Failure here is a critical security flaw.

**Independent Test**: Create Account A and add 3 recipes. Create Account B -- no recipes
from Account A appear. Log back into Account A -- its 3 recipes are still there and
Account B's data is not visible.

**Acceptance Scenarios**:

1. **Given** User A and User B have separate accounts, **When** User A logs in, **Then**
   they can only see and modify recipes they created.
2. **Given** User B creates a recipe with the same title as one of User A's recipes,
   **When** User A views their recipe list, **Then** User A sees only their own version.
3. **Given** an unauthenticated request attempts to access any data endpoint, **Then**
   the request is rejected with an HTTP 401 response.

---

### User Story 5 -- Deploy & Access via Public URL (Priority: P2)

The app is deployed to a public URL. Any user can register from that URL and use all
features. The developer can share the URL to demonstrate the product without running a
local server.

**Why this priority**: Required for exercise submission. The app must be publicly
accessible to meet the submission requirements.

**Independent Test**: Open the public URL in an incognito window. Register, create a
recipe, assign it to a meal plan, generate a grocery list -- all features work
end-to-end.

**Acceptance Scenarios**:

1. **Given** the app is deployed, **When** a user navigates to the public URL, **Then**
   the app loads within 5 seconds.
2. **Given** the deployed app, **When** a user registers and creates a recipe, **Then**
   the recipe is saved and visible after a full page refresh.
3. **Given** the deployed app, **When** a user logs in from a mobile browser, **Then**
   the layout is usable and no core features are broken.

---

### Edge Cases

- **Email already taken**: Show "Email already in use" error on registration.
- **Session expiry**: Redirect to login page with a "Session expired" message; preserve
  any unsaved form data where possible.
- **Network offline**: Write operations show a user-friendly failure message; the page
  does not crash.
- **Cross-user recipe URL**: Accessing `/recipes/[id]` for another user's recipe returns
  a "Recipe not found" page (same as a soft-deleted recipe).
- **First-time login**: The 20 seed recipes are automatically copied to the new user's
  account so they can explore all features without manual data entry.
- **Deleted recipe in meal plan**: Meal slot displays a "(Recipe deleted)" placeholder
  rather than crashing.

---

## Requirements *(mandatory)*

### Functional Requirements

**Authentication**

- **FR-001**: Users MUST be able to register with a valid email address and a password
  of at least 8 characters.
- **FR-002**: Users MUST be able to log in with their registered email and password.
- **FR-003**: Users MUST be able to log out from any page, clearing their session.
- **FR-004**: Unauthenticated users MUST be redirected to `/login` when accessing any
  protected route.
- **FR-005**: The system MUST display clear validation messages for invalid auth inputs.

**Data Persistence**

- **FR-006**: All recipes created by a user MUST be stored in the cloud and accessible
  from any device after login.
- **FR-007**: Weekly meal plans MUST persist per user, per ISO week, across devices.
- **FR-008**: Grocery lists MUST persist per user, per ISO week, across devices.
- **FR-009**: Checked/unchecked state of grocery items MUST persist across reloads.
- **FR-010**: Manually added grocery items MUST be preserved when the grocery list is
  re-generated from the meal plan.

**Data Privacy**

- **FR-011**: Each user MUST only have read and write access to their own data.
- **FR-012**: Unauthenticated requests to any data endpoint MUST be rejected with HTTP
  401.
- **FR-013**: Row Level Security MUST ensure database-level isolation between users even
  if application logic is bypassed.

**Migration Behaviour**

- **FR-014**: 20 seed recipes MUST be copied to every new user account on first login.
- **FR-015**: The existing recipe search (title, ingredient, diet tag) MUST work after
  migration.
- **FR-016**: The ingredient aggregation logic for grocery list generation MUST produce
  identical results to the current implementation.

**Deployment**

- **FR-017**: The app MUST be accessible via a public HTTPS URL without any local server.
- **FR-018**: All environment secrets MUST NOT be committed to the repository.
- **FR-019**: The `output: 'export'` setting in next.config.ts MUST be removed to enable
  Next.js API Routes; the app is deployed via Vercel (server runtime supported).

### Key Entities

- **User**: Managed by Supabase Auth. Has `id` (UUID), `email`, `created_at`. Parent of
  all other entities.
- **Recipe**: A cooking recipe owned by one User. Has `id`, `user_id`, `title`,
  `photo_url`, `cook_time_minutes`, `servings`, `tags` (text[]), `created_at`,
  `updated_at`, `deleted_at` (soft-delete).
- **IngredientLine**: Belongs to a Recipe. Has `id`, `recipe_id`, `name`, `quantity`
  (numeric), `unit`, `sort_order`.
- **PreparationStep**: Belongs to a Recipe. Has `id`, `recipe_id`, `order`, `description`.
- **MealPlan**: Weekly plan owned by one User. Has `id`, `user_id`, `iso_week`,
  `updated_at`. Unique constraint on `(user_id, iso_week)`.
- **MealSlot**: Assignment within a MealPlan. Has `id`, `meal_plan_id`, `day`,
  `meal_type`, `recipe_id`. Unique constraint on `(meal_plan_id, day, meal_type)`.
- **GroceryList**: Shopping list owned by one User per week. Has `id`, `user_id`,
  `iso_week`, `generated_at`, `updated_at`. Unique on `(user_id, iso_week)`.
- **GroceryItem**: Line item in a GroceryList. Has `id`, `grocery_list_id`, `name`,
  `quantity` (numeric), `unit`, `category`, `checked`, `is_manual`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration, create a recipe, and view it on a
  second device -- all within 5 minutes of first opening the app.
- **SC-002**: All user data remains fully available after clearing browser localStorage
  and logging in again.
- **SC-003**: Two concurrent users never see each other's data.
- **SC-004**: The app is accessible via a public URL and all 5 core features (recipe
  CRUD, meal planning, grocery list generation, search/filter, dashboard) work in
  production.
- **SC-005**: The app loads at the public URL within 5 seconds on a standard mobile
  connection.
- **SC-006**: All 90 existing unit tests continue to pass after migration.
- **SC-007**: 20 seed recipes are available to every new user on first login.

---

## Assumptions

- Email/password authentication only; no social login (Google/GitHub) required for v1.
- Real-time cross-device sync within the same page load is sufficient; sub-second
  push across multiple concurrent sessions is not required.
- Seed recipes are copied per user (to their own account on first login), not shared
  globally between users.
- Soft-delete behaviour for recipes is preserved.
- ISO-week-based data model for MealPlan and GroceryList is retained unchanged.
- Free tier of Supabase and Vercel is sufficient for demo/evaluation purposes.
- `output: 'export'` will be removed since Vercel supports Next.js server-side features
  natively and API Routes are required for the backend layer.

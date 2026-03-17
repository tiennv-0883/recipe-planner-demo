# Feature Specification: Recipe Planner Web Application

**Feature Branch**: `001-recipe-planner-app`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "Recipe Planner web application — modern dashboard with Recipe Manager, Meal Planner, and Grocery List Generator"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recipe Management (Priority: P1)

A user manages their personal recipe library. They can create new recipes by entering a title,
uploading or linking a photo, specifying cook time, servings per recipe, and dietary tags
(e.g., breakfast, dinner, healthy, vegan). Each recipe contains a structured list of ingredients
with name, quantity, and unit of measure, plus a numbered list of preparation steps. The user
can also edit existing recipes or permanently delete ones they no longer need.

**Why this priority**: Recipes are the single source of truth for the entire application.
Without a working recipe library, neither the Meal Planner nor the Grocery List can function.
This story delivers standalone value as a digital recipe book.

**Independent Test**: Can be fully tested by creating, editing, and deleting a recipe via the
Recipes page. Verification: recipe persists across page reloads and appears in the recipe list
with correct metadata.

**Acceptance Scenarios**:

1. **Given** the user is on the Recipes page, **When** they click "Add Recipe" and fill in title,
   cook time, servings, at least one ingredient (name + quantity + unit), at least one step, and
   at least one tag, **Then** the recipe appears in the recipe list and is retrievable by title search.
2. **Given** an existing recipe, **When** the user opens it and changes an ingredient quantity
   and saves, **Then** the updated quantity is shown on the recipe detail view.
3. **Given** an existing recipe that has not been assigned to any meal plan, **When** the user
   deletes it, **Then** it no longer appears in the recipe list.
4. **Given** an existing recipe that is currently assigned to a meal plan, **When** the user
   attempts to delete it, **Then** the system warns the user that the recipe is used in a meal plan
   before allowing the deletion to proceed.
5. **Given** the user views a recipe in detail, **When** the page loads, **Then** all ingredients
   with their quantities and units, all preparation steps in order, cook time, servings, and tags
   are displayed.

---

### User Story 2 - Meal Planning (Priority: P2)

A user plans their eating for the coming week using the Meal Planner. The planner shows a
calendar-style grid with seven columns (Monday–Sunday) and three rows (Breakfast, Lunch, Dinner).
Each cell represents one meal slot. The user can search the recipe library from within the planner
and assign a recipe to any meal slot — either by clicking the slot and selecting a recipe, or by
dragging a recipe card and dropping it onto the target slot. They can also remove a recipe from
a slot or swap it for a different one.

**Why this priority**: Meal planning is the central activity of the application. It connects the
recipe library to the grocery list and produces the weekly schedule shown on the Dashboard.
Without it, the Grocery List Generator has nothing to process.

**Independent Test**: Can be fully tested by opening the Meal Planner (assuming at least two
recipes exist), assigning recipes to several meal slots, and verifying the grid correctly
reflects all assignments after a page reload.

**Acceptance Scenarios**:

1. **Given** the user is on the Meal Planner page, **When** they click on an empty meal slot
   and select a recipe from the picker, **Then** the recipe title and thumbnail appear in that slot.
2. **Given** a meal slot that already contains a recipe, **When** the user drops a different recipe
   onto that slot, **Then** the new recipe replaces the previous one.
3. **Given** a meal slot containing a recipe, **When** the user removes the recipe from the slot,
   **Then** the slot becomes empty.
4. **Given** a recipe detail view, **When** the user clicks "Add to Meal Planner", **Then** a dialog
   appears allowing them to pick the target day and meal type, and the recipe is assigned accordingly.
5. **Given** the user is on the Meal Planner, **When** they navigate between weeks,
   **Then** each week's plan is stored independently and does not overwrite other weeks.

---

### User Story 3 - Grocery List Generation (Priority: P3)

A user generates a shopping list for the current week. The system automatically aggregates all
ingredients from every recipe assigned in the active weekly Meal Planner — combining identical
ingredients across recipes by summing their quantities where units are compatible. The list is
grouped by food category (e.g., Vegetables, Meat & Fish, Dairy, Grains & Bread, Spices &
Seasonings, Other). The user sees the list as a checklist and can tick off items as they shop.
They can also manually add items not derived from any recipe (e.g., household goods) and
adjust individual quantities.

**Why this priority**: This module is the key time-saving automation of the app. It converts
the meal plan into actionable shopping information without any manual transcription.

**Independent Test**: Can be fully tested by populating at least three meal slots with recipes
that share an ingredient, then navigating to Grocery List. Verification: the shared ingredient
appears once with the combined quantity, items are grouped by category, and checking/unchecking
persists across page reloads.

**Acceptance Scenarios**:

1. **Given** a meal plan with multiple recipes sharing the ingredient "tomato (500g)" and
   "tomato (300g)", **When** the Grocery List is generated, **Then** a single "Tomato — 800g"
   line appears under the appropriate category.
2. **Given** a generated grocery list, **When** the user ticks an item as purchased,
   **Then** the item is visually marked complete and remains checked after page reload.
3. **Given** the grocery list, **When** the user edits the quantity of an item,
   **Then** the updated quantity is saved and shown on next visit.
4. **Given** the grocery list, **When** the user manually adds an item not derived from any recipe,
   **Then** the item appears in the list (default category: Other) and can be checked and removed.
5. **Given** the meal plan has no recipes assigned, **When** the user visits Grocery List,
   **Then** the list is empty with a prompt to start planning meals.

---

### User Story 4 - Dashboard Overview (Priority: P4)

A user opens the application and immediately sees a summary of their week. The Dashboard
displays the current week's meal plan in a compact view (days and meal slots), highlights any
unfilled slots, and shows a condensed preview of the grocery list (e.g., top 5–10 items or
total item count). From the Dashboard, the user can click through to any module.

**Why this priority**: The Dashboard reduces navigation friction for returning users who want
a quick status check without visiting each section individually. It requires P1–P3 to be
functional before it can render meaningfully.

**Independent Test**: Can be fully tested by populating a meal plan and then loading the
Dashboard; verify that the weekly meals summary and grocery list preview reflect the active plan.

**Acceptance Scenarios**:

1. **Given** the current week has three meal slots filled, **When** the user opens the Dashboard,
   **Then** those three recipes are visible in the weekly summary with their day and meal labels.
2. **Given** the current week has an incomplete grocery list (some items unchecked), **When** the
   user views the Dashboard, **Then** the grocery preview shows the count of remaining items.
3. **Given** the user clicks a recipe name in the Dashboard weekly summary, **Then** they are
   taken to that recipe's detail view.

---

### User Story 5 - Recipe Discovery & Filtering (Priority: P5)

A user searches their recipe library to find a suitable dish. They can type a keyword (recipe
name or ingredient name) into a search bar and see instant results. They can also filter by
one or more dietary tags (breakfast, lunch, dinner, healthy, vegan, vegetarian) and have the
recipe list update accordingly. Recipes can be viewed as a card grid (with image, cook time,
servings, tags visible) or as a compact list.

**Why this priority**: Search and filtering become important once the library grows beyond a few
recipes. This story enhances the Recipes page without being a prerequisite for any other module.

**Independent Test**: Can be tested standalone on the Recipes page with a library of ≥10 recipes
by searching for an ingredient and verifying that only matching recipes appear in results.

**Acceptance Scenarios**:

1. **Given** a library of recipes, **When** the user types a partial recipe name into the search
   bar, **Then** only recipes whose title contains the search text are shown (case-insensitive).
2. **Given** a library of recipes, **When** the user types an ingredient name into the search bar,
   **Then** recipes containing that ingredient are included in results.
3. **Given** a library of recipes, **When** the user selects the "vegan" tag filter,
   **Then** only recipes tagged "vegan" are displayed.
4. **Given** the user toggles to card view, **Then** each recipe is shown as a card with image,
   cook time, servings count, and tags visible without opening the detail view.
5. **Given** the user toggles to list view, **Then** recipes are shown in a compact row format.

---

### Edge Cases

- What happens when two recipes use the same ingredient in incompatible units (e.g., "500g tomato" and "2 tomatoes")? → The system MUST display them as separate line items in the grocery list and the user must resolve the discrepancy manually.
- What happens when a recipe used in the active meal plan is deleted? → The meal slot MUST display a "Recipe removed" placeholder; the user is notified and prompted to replace it.
- What happens when a user manually edits a grocery quantity and then the meal plan changes? → Manual overrides are preserved; the system does not silently overwrite user-modified quantities. A "refresh from meal plan" action is available to explicitly recalculate.
- What happens if a meal slot is occupied and the user drops another recipe onto it? → The incoming recipe replaces the existing one after a brief confirmation prompt.
- What happens when the user accesses the app on a week with no existing plan? → An empty meal plan grid is shown; the Grocery List page shows an empty state with guidance.
- What happens when a recipe has zero ingredients? → The system MUST prevent saving a recipe without at least one ingredient and display a validation message.

## Requirements *(mandatory)*

### Functional Requirements

**Recipe Manager**

- **FR-001**: Users MUST be able to create a recipe with: title, photo (optional), cook time, servings, dietary tags, at least one ingredient (name, quantity, unit), and at least one preparation step.
- **FR-002**: Users MUST be able to edit any field of an existing recipe and save the changes.
- **FR-003**: Users MUST be able to delete a recipe; if the recipe is assigned to a meal plan the system MUST require explicit confirmation before deleting.
- **FR-004**: The system MUST normalize ingredient names at ingestion time (trim whitespace, consistent capitalisation) to prevent duplicate entries such as "Tomato" and "tomato".
- **FR-005**: Users MUST be able to view a recipe in full detail: all ingredients with quantities and units, all ordered preparation steps, cook time, servings, and tags.

**Recipes Discovery**

- **FR-006**: Users MUST be able to search recipes by title keyword (partial match, case-insensitive).
- **FR-007**: Users MUST be able to search recipes by ingredient name.
- **FR-008**: Users MUST be able to filter the recipe library by one or more dietary tags simultaneously.
- **FR-009**: Users MUST be able to toggle the recipe library view between card grid and compact list.

**Meal Planner**

- **FR-010**: The Meal Planner MUST display a weekly grid with columns Monday–Sunday and rows Breakfast, Lunch, and Dinner.
- **FR-011**: Users MUST be able to assign a recipe to any meal slot by selecting from the recipe library within the planner.
- **FR-012**: Users MUST be able to assign a recipe to a meal slot by dragging a recipe card and dropping it onto the target slot.
- **FR-013**: Users MUST be able to remove a recipe from a meal slot, leaving it empty.
- **FR-014**: Users MUST be able to navigate between different weeks; each week's plan MUST be stored independently.
- **FR-015**: On a recipe detail view, a "Add to Meal Planner" button MUST allow the user to pick day and meal type and assign the recipe directly.

**Grocery List Generator**

- **FR-016**: The system MUST automatically aggregate all ingredients from all recipes in the active week's meal plan into a grocery list, combining identical ingredients (same normalized name and unit) by summing quantities.
- **FR-017**: Grocery list items MUST be grouped by food category (Vegetables & Fruits, Meat & Fish, Dairy & Eggs, Grains & Bread, Spices & Seasonings, Other).
- **FR-018**: Users MUST be able to mark individual grocery items as purchased; checked state MUST persist across sessions.
- **FR-019**: Users MUST be able to manually edit the quantity of any grocery list item.
- **FR-020**: Users MUST be able to manually add items to the grocery list that are not derived from any recipe; those items default to the "Other" category unless the user specifies one.
- **FR-021**: Users MUST be able to remove manually added items from the grocery list.
- **FR-022**: A "Refresh from Meal Plan" action MUST recalculate auto-generated items from the current meal plan without overwriting manually added items or user-modified quantities.

**Dashboard**

- **FR-023**: The Dashboard MUST display a compact summary of the current week's meal plan showing assigned recipes per day and meal type.
- **FR-024**: The Dashboard MUST display a grocery list preview showing at minimum the total count of unchecked items and the top items by category.
- **FR-025**: All sections of the Dashboard MUST link to the corresponding full-page view.

**Navigation & Layout**

- **FR-026**: The application MUST provide a persistent left sidebar with navigation items: Dashboard, Recipes, Meal Planner, and Grocery List.
- **FR-027**: All write operations (create, update, delete) MUST require the user to be authenticated.

### Key Entities

- **Recipe**: Represents a single dish. Attributes: title, photo URL, cook time (minutes), servings (count), dietary tags (list), ingredients (list of IngredientLine), preparation steps (ordered list), created/updated timestamps, soft-delete timestamp.
- **IngredientLine**: Part of a Recipe. Attributes: ingredient name, quantity (numeric), unit of measure (e.g., g, ml, pcs, tbsp).
- **MealPlan**: Represents one week's plan for a user. Attributes: year-week identifier, owner (user), list of MealSlots.
- **MealSlot**: One cell in the meal plan grid. Attributes: day of week (Mon–Sun), meal type (breakfast / lunch / dinner), reference to a Recipe (nullable).
- **GroceryList**: Derived from a MealPlan. Attributes: reference to MealPlan, list of GroceryItems, last-generated timestamp.
- **GroceryItem**: One item on the shopping list. Attributes: name, quantity, unit, food category, checked (boolean), is_manual (boolean), display order.

## Assumptions

- Users authenticated via standard email + password; social login is out of scope for v1.
- A single user sees only their own recipes and meal plans (single-tenant per account); sharing or collaboration is out of scope for v1.
- The weekly meal plan starts on Monday and ends on Sunday; week navigation uses ISO week numbering.
- Ingredient unit conversion (e.g., grams ↔ ounces) is out of scope for v1; incompatible units are displayed as separate grocery items.
- Photo upload is optional on recipes; the system MUST function fully without images.
- Dietary tag vocabulary is fixed for v1: Breakfast, Lunch, Dinner, Healthy, Vegan, Vegetarian. Custom tags are out of scope.
- Food category classification for grocery items is inferred from a predefined ingredient-category mapping; items not matched fall into "Other".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a complete recipe (title, 5 ingredients with quantities, 3 steps, 1 tag) in under 2 minutes from a blank form.
- **SC-002**: A user can fill all 21 meal slots for a full week in under 5 minutes using search and assignment within the Meal Planner.
- **SC-003**: The grocery list is automatically generated from the current meal plan without the user manually entering any ingredient — 0% manual re-entry for recipe-derived items.
- **SC-004**: Users can find any recipe in a library of 50+ recipes in under 30 seconds using search or tag filtering.
- **SC-005**: The weekly meal plan summary and grocery list preview are visible on the Dashboard in a single click from the current page, at any time.
- **SC-006**: Grocery items derived from multiple recipes that share an identical ingredient are merged into one line item — no duplicate ingredient rows for the same name and unit.
- **SC-007**: All user data (recipes, meal plans, grocery list state) is preserved across browser sessions and devices without re-entry.

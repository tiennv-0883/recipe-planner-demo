# Feature Specification: Multi-Recipe Meal Slots

**Feature Branch**: `004-multi-recipe-meal-slots`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Each meal slot in the Meal Planner can hold multiple recipes instead of just one. Grocery List must recalculate total ingredients from all recipes, merging duplicates."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Add Multiple Recipes to a Meal Slot (Priority: P1)

A user can assign more than one recipe to a single meal slot (e.g., Monday Dinner can have both "Chicken Stir Fry" and "Greek Salad"). The slot displays all assigned recipes. Adding a second recipe to an already-filled slot does not replace the first — it appends.

**Why this priority**: This is the core capability of the feature. Without it, the remaining stories cannot exist. Delivers immediate value by allowing users to plan complete meals (main + side dish).

**Independent Test**: Open Meal Planner for the current week → assign a second recipe to any slot that already has one → both recipes appear in the slot → save and reload → both still appear.

**Acceptance Scenarios**:

1. **Given** a meal slot is empty, **When** a user assigns a recipe, **Then** the recipe appears in that slot.
2. **Given** a meal slot already has 1 recipe, **When** a user assigns a second recipe, **Then** both recipes appear in the slot (existing recipe is not replaced).
3. **Given** a meal slot has 2 recipes, **When** the user saves and reloads the page, **Then** both recipes are still shown.
4. **Given** a meal slot has 3 recipes (maximum), **When** the user attempts to add a 4th, **Then** the add affordance is hidden/disabled and a message explains the limit.

---

### User Story 2 — Remove a Single Recipe from a Slot (Priority: P2)

A user can remove one specific recipe from a multi-recipe slot without clearing the entire slot. After removal, the remaining recipes in the slot are unaffected.

**Why this priority**: Directly supports US1 — adding is only useful if individual removal is possible. Without this, users must clear the entire slot to fix mistakes.

**Independent Test**: Assign 2 recipes to a slot → remove only the second one → first recipe still shows → reload → single recipe persists.

**Acceptance Scenarios**:

1. **Given** a slot has 2 recipes, **When** the user removes the second recipe, **Then** only the first recipe remains in the slot.
2. **Given** a slot has 1 recipe, **When** the user removes it, **Then** the slot becomes empty (placeholder shown).
3. **Given** a slot has 2 recipes and the user removes one, **When** the page is reloaded, **Then** the removal is persisted.

---

### User Story 3 — Grocery List Aggregates Across All Slot Recipes (Priority: P1)

When a user generates the Grocery List for a week, ingredients from all recipes across all slots are collected and merged. Duplicate ingredients with the same name and unit are summed. Ingredients with the same name but incompatible units remain as separate items.

**Why this priority**: Equal priority to US1 — multi-recipe slots without correct grocery aggregation would make the feature incomplete (users could under-buy ingredients).

**Independent Test**: Assign two recipes both requiring "garlic 3 cloves" to different slots → generate Grocery List → garlic appears once as "6 cloves" (not twice as "3 cloves").

**Acceptance Scenarios**:

1. **Given** Recipe A needs "garlic 3 cloves" and Recipe B needs "garlic 2 cloves" and both are assigned in the same week, **When** the Grocery List is generated, **Then** garlic appears as "5 cloves".
2. **Given** Recipe A needs "flour 200g" and Recipe B needs "flour 1 cup", **When** the Grocery List is generated, **Then** flour appears as two separate line items (incompatible units are not merged).
3. **Given** a slot has 2 recipes and one is removed, **When** the Grocery List is regenerated, **Then** it no longer includes that recipe's ingredients.
4. **Given** no recipes are assigned in the week, **When** the Grocery List is generated, **Then** it shows an empty list.

---

### User Story 4 — Meal Planner Grid Shows Multiple Recipes Per Slot (Priority: P2)

The Meal Planner grid shows all recipes assigned to each slot as a compact list. Each recipe entry has an individual remove button. An "Add recipe" affordance is visible on slots below the 3-recipe limit.

**Why this priority**: Without updated UI, US1 and US2 have no user-facing surface.

**Independent Test**: Assign 2 recipes to Monday Dinner → the MealGrid cell shows both recipe titles stacked, each with its own × button, plus an "Add" button still visible (limit not reached).

**Acceptance Scenarios**:

1. **Given** a slot has 2 recipes, **When** the user views the Meal Planner grid, **Then** both recipe titles are visible in that cell.
2. **Given** a slot has 0 recipes, **When** the user views the grid, **Then** the slot shows a placeholder and an "Add" button.
3. **Given** a slot has 3 recipes, **When** the user views the grid, **Then** no "Add" button is shown for that slot.
4. **Given** the user clicks × next to a recipe title in a slot, **Then** that recipe is removed from the slot immediately.

---

### Edge Cases

- What happens when a recipe is deleted from Recipe Manager while assigned to a slot? → The slot silently drops that recipe ID on next load; the Grocery List recalculates without it.
- What if the same recipe is added twice to the same slot? → The system prevents duplicates — assigning an already-present recipeId to the same slot is a no-op (or shows a warning).
- What if two recipes have ingredient names with different capitalisation ("Tomato" vs "tomato")? → Names are normalized to lowercase before aggregation (existing behaviour in `aggregateIngredients()`).
- What happens to existing single-recipe meal slots after the schema migration? → Existing `meal_slots.recipe_id` data is migrated to the new junction structure; no slots lose their assigned recipe.
- What if a week has 21 slots each with 3 recipes (63 total)? → Grocery List aggregation still completes and produces a correct merged list within 2 seconds.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A meal slot MUST support zero or more recipe assignments (replacing the current 1-to-1 constraint).
- **FR-002**: A meal slot MUST enforce a maximum of 3 recipes per slot.
- **FR-003**: Users MUST be able to add a recipe to any slot that currently has fewer than 3 assigned recipes.
- **FR-004**: Users MUST be able to remove a single recipe from a slot without affecting other recipes in the same slot.
- **FR-005**: The system MUST prevent the same recipe from being assigned twice to the same slot.
- **FR-006**: The Grocery List generator MUST collect ingredients from all recipes across all slots in the selected week.
- **FR-007**: The Grocery List generator MUST sum quantities of ingredients sharing the same normalized name and compatible unit.
- **FR-008**: The Grocery List generator MUST preserve separate line items for ingredients with the same name but incompatible units.
- **FR-009**: The Meal Planner grid MUST display all assigned recipe titles for each slot.
- **FR-010**: The Meal Planner grid MUST show an "Add recipe" affordance on slots with fewer than 3 recipes.
- **FR-011**: Existing single-recipe meal slot assignments MUST be automatically migrated to the new multi-recipe structure without data loss.
- **FR-012**: All slot assignments MUST be persisted to the backend and survive page reload.

### Key Entities

- **MealSlot**: Represents one meal occasion (day + meal type in a week). Owns `recipeIds: string[]` (0–3 entries) instead of a single `recipeId`.
- **MealSlotRecipe** *(new junction)*: Associates a MealSlot with a Recipe. Attributes: `slot_id`, `recipe_id`, `position` (display order). Unique constraint on `(slot_id, recipe_id)`.
- **MealPlan**: Unchanged — owns a week's set of MealSlots.
- **GroceryList**: Unchanged structure — derived from all ingredients across all recipes in the week's MealSlots.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add 3 recipes to a single meal slot in under 30 seconds total.
- **SC-002**: The Grocery List correctly sums duplicate ingredients (same name + unit) from all recipes in the week — verified manually and via unit tests.
- **SC-003**: All existing meal plan data is preserved after the migration — 0 slots show as empty that were previously filled.
- **SC-004**: Recipe add/remove operations are persisted — page reload shows identical slot state 100% of the time.
- **SC-005**: Grocery List generation completes under 2 seconds for a fully-populated week (21 slots × 3 recipes).
- **SC-006**: All existing 102 unit tests continue to pass; new tests cover multi-recipe aggregation and slot management.

---

## Assumptions

- Maximum 3 recipes per slot balances flexibility and grid readability. Revisit in a future spec if user feedback demands more.
- Recipe deletion is handled by silently dropping the deleted recipe from affected slots — no blocking error is shown to the user.
- The existing `aggregateIngredients()` utility handles name normalisation and incompatible-unit separation correctly; Grocery List changes only need to feed it more input (multiple recipes per slot).
- Servings quantities are NOT scaled by the number of slots — ingredients use the recipe's original quantities as-is (same behaviour as current single-recipe slots).
- `meal_slots.recipe_id` column is retained as nullable during migration and removed in a follow-up migration after all client code is updated.

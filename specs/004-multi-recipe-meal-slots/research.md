# Research: Multi-Recipe Meal Slots

## Decision 1 — Database schema: additive junction table

**Decision**: Add a new `meal_slot_recipes (id, slot_id, recipe_id, position)` table. Migrate existing `meal_slots.recipe_id` values into it. Make `meal_slots.recipe_id` nullable. Drop in spec 005.

**Rationale**:
- Cleanest normalisation: the relationship between a slot and a recipe is truly many-to-many (up to 3 per slot).
- Additive migration is safe: no existing rows lose data; the old column retains its value through the deprecation period.
- Constitution Principle V: destructive column drop deferred until all code has been updated and verified.

**Alternatives considered**:
1. *PostgreSQL array column* (`recipe_ids uuid[]`) — simpler migration but loses referential integrity, cannot use FK ON DELETE CASCADE, violates Principle V's "data integrity" intent.
2. *Embedded JSON* — same objections plus no indexing.
3. *Drop recipe_id immediately* — violates Principle V; risks data loss if migration is rolled back.

---

## Decision 2 — TypeScript type: rename field to `recipeIds: string[]`

**Decision**: `MealSlot.recipeId: string` → `MealSlot.recipeIds: string[]`.

**Rationale**:
- Plural name clearly communicates cardinality change and prevents calling code from treating it as a single ID.
- Cascades predictably: TypeScript strict mode surfaces every usage that must be updated.
- Empty array `[]` represents a slot with no recipes (slot row exists but no junction rows).

**Alternatives considered**:
1. *Keep `recipeId?: string` + add `extraRecipeIds?: string[]`* — confusing primary/extra split; two code paths forever.
2. *Add a `recipes: Recipe[]` field* — embeds domain objects into a plain slot type; breaks the intent of MealSlot as a reference-only struct.

---

## Decision 3 — POST /slots semantics: APPEND not REPLACE

**Decision**: POST `/api/meal-plans/[week]/slots` body shape is unchanged `{ day, mealType, recipeId }`. Semantics change from *replace entire slot* to *append recipeId to slot's list*. Returns 409 when slot already has 3 recipes or recipeId is already present.

**Rationale**:
- Minimal API surface change — clients that already call this endpoint do not lose functionality; they gain append behaviour.
- Chef's workflow is additive (FR-004-001: "I can add multiple recipes to a meal slot").
- A REPLACE endpoint (`PUT`) would require the client to always send a full array; wasteful for the common one-add case.

**Alternatives considered**:
1. *Switch to PUT with full recipeIds array* — requires client to read state before write; race-condition prone.
2. *New POST endpoint `/slots/[slotId]/recipes`* — would require a two-step flow (find/create slot, then add recipe); more round-trips.

---

## Decision 4 — New DELETE route for single-recipe removal

**Decision**: `DELETE /api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]` — removes one row from `meal_slot_recipes`. Auto-deletes the `meal_slots` row if no recipes remain.

**Rationale**:
- RESTful resource hierarchy: `slots/[slotId]/recipes/[recipeId]` clearly expresses ownership.
- Auto-cleanup of empty slot rows prevents orphan slot rows from accumulating (a slot with no recipes has no user-visible meaning).
- Keep `DELETE /slots/[slotId]` for "clear all" (unchanged semantics).

**Alternatives considered**:
1. *Patch /slots/[slotId] with a partial recipeIds array* — ambiguous (replace or diff?); harder to validate.
2. *Reuse DELETE /slots/[slotId] with optional recipeId in body* — HTTP DELETE with body is non-standard and poorly supported by some proxies.

---

## Decision 5 — Grocery list: flatMap over recipeIds for each slot

**Decision**: `generateGroceryList` changes from `const recipe = recipesById[slot.recipeId]` to `slot.recipeIds.flatMap(id => recipesById[id]?.ingredients ?? [])`. The existing `aggregateIngredients()` helper receives the combined ingredient list unchanged.

**Rationale**:
- Minimal change: one line replaced, all normalisation/aggregation logic untouched.
- `aggregateIngredients()` already handles duplicate ingredients across recipes (sums same-unit quantities, groups incompatible units). No changes needed there.
- Constitution Principle I: Grocery List module receives `Recipe[]` as input — it does not query the DB directly; no new coupling introduced.

**Alternatives considered**:
1. *Pass full Recipe objects into the slot* — would require changes to MealSlot type and all slot storage; over-engineering for a lookup that already works.

---

## Decision 6 — Max-3 enforced in service layer only

**Decision**: `MAX_RECIPES_PER_SLOT = 3` constant lives in `src/services/mealPlanner.ts`. The database has no CHECK constraint on row count. `addRecipeToSlot()` checks `slot.recipeIds.length >= MAX_RECIPES_PER_SLOT` before inserting.

**Rationale**:
- Changing a business rule (e.g., max 5) requires no database migration — only a constant update.
- DB UNIQUE `(slot_id, recipe_id)` constraint already handles the duplicate-recipe error at the data layer.
- UI reads `slot.recipeIds.length >= MAX_RECIPES_PER_SLOT` to disable the Add button — single source of truth is the (client-visible) constant.

**Alternatives considered**:
1. *DB CHECK constraint* — would enforce the rule at DB level but requires a migration to change the limit; cannot be easily unit-tested without a live DB.
2. *UI-only enforcement* — easily bypassed via direct API call; constitution requires server-side validation.

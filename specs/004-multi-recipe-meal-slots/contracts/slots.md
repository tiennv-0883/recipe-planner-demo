# API Contracts: Meal Slot Endpoints

## Overview of Changes

| Method | Path | Change |
|--------|------|--------|
| `POST` | `/api/meal-plans/[week]/slots` | Semantics: REPLACE → APPEND |
| `DELETE` | `/api/meal-plans/[week]/slots/[slotId]` | Unchanged (clear all) |
| `DELETE` | `/api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]` | **NEW** — remove one recipe |

---

## POST `/api/meal-plans/[week]/slots`

### Description
Adds a recipe to the specified meal slot. Creates the slot row if it does not yet exist for the given `(day, mealType)`. Previously replaced the slot; now appends.

### Authentication
Supabase session cookie required (GET `/api/auth/session`). Returns 401 if missing.

### Path Parameters
| Param | Type | Description |
|-------|------|-------------|
| `week` | `string` | ISO week string, e.g. `2026-W10` |

### Request Body
```json
{
  "day": "Monday",
  "mealType": "lunch",
  "recipeId": "uuid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day` | `DayOfWeek` | ✅ | Monday–Sunday |
| `mealType` | `MealType` | ✅ | breakfast / lunch / dinner |
| `recipeId` | `string (uuid)` | ✅ | ID of an existing recipe owned by the user |

### Success Response — 200 OK
```json
{
  "id": "slot-uuid",
  "day": "Monday",
  "mealType": "lunch",
  "recipeIds": ["recipe-uuid-1", "recipe-uuid-2"]
}
```

### Error Responses

| Status | Code | Condition |
|--------|------|-----------|
| 400 | `INVALID_INPUT` | Missing or invalid field |
| 401 | `UNAUTHORIZED` | No valid session |
| 404 | `RECIPE_NOT_FOUND` | `recipeId` does not exist or not owned by user |
| 409 | `SLOT_FULL` | Slot already has 3 recipes |
| 409 | `RECIPE_ALREADY_IN_SLOT` | `recipeId` already present in this slot |

### Behaviour Change from Spec 003

| Spec 003 | Spec 004 |
|----------|----------|
| DELETE existing slot row for `(day, mealType)` | Find or create slot row for `(day, mealType)` |
| INSERT new slot row with recipeId | INSERT into `meal_slot_recipes` |
| Slot always has exactly 1 recipe | Slot has 0–3 recipes |

---

## DELETE `/api/meal-plans/[week]/slots/[slotId]`

### Description
Clears the entire meal slot — removes the `meal_slots` row and all associated `meal_slot_recipes` rows (via ON DELETE CASCADE). Semantics **unchanged** from spec 003.

### Path Parameters
| Param | Type | Description |
|-------|------|-------------|
| `week` | `string` | ISO week string |
| `slotId` | `string (uuid)` | ID of slot to delete |

### Success Response — 204 No Content

### Error Responses
| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | No valid session |
| 404 | `SLOT_NOT_FOUND` | Slot ID not found or not owned by user |

---

## DELETE `/api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]`  ← NEW

### Description
Removes a single recipe from the specified slot. If this was the last recipe in the slot, the `meal_slots` row is also deleted.

### Path Parameters
| Param | Type | Description |
|-------|------|-------------|
| `week` | `string` | ISO week string |
| `slotId` | `string (uuid)` | ID of the meal slot |
| `recipeId` | `string (uuid)` | ID of the recipe to remove |

### Success Response — 204 No Content

### Error Responses
| Status | Code | Condition |
|--------|------|-----------|
| 401 | `UNAUTHORIZED` | No valid session |
| 404 | `SLOT_NOT_FOUND` | Slot ID not found or not owned by user |
| 404 | `RECIPE_NOT_IN_SLOT` | `recipeId` not present in this slot |

### Cascade Cleanup
After deleting the `meal_slot_recipes` row:
- Query remaining count for this `slot_id`
- If count = 0 → DELETE `meal_slots` row

---

## Route File Locations

| Endpoint | File |
|----------|------|
| POST /slots | `src/app/api/meal-plans/[week]/slots/route.ts` |
| DELETE /slots/[slotId] | `src/app/api/meal-plans/[week]/slots/[slotId]/route.ts` |
| DELETE /slots/[slotId]/recipes/[recipeId] | `src/app/api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]/route.ts` ← NEW |

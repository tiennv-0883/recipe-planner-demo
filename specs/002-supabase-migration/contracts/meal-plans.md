# Contract: Meal Plans API

**Module**: Meal Planner | **Base path**: `/api/meal-plans` | **Date**: 2026-03-14

All requests require an authenticated session cookie.

---

## GET /api/meal-plans/[week]

Get the meal plan for a specific ISO week.

### Path parameter

`week`: ISO week string, format `YYYY-Www`, e.g. `2026-W11`

### Response 200

```json
{
  "mealPlan": {
    "isoWeek": "2026-W11",
    "slots": [
      {
        "id": "2026-W11-monday-breakfast",
        "day": "monday",
        "mealType": "breakfast",
        "recipeId": "uuid"
      }
    ],
    "updatedAt": "2026-03-14T10:00:00Z"
  }
}
```

Returns `{ "mealPlan": { "isoWeek": "...", "slots": [], "updatedAt": "..." } }` if
no meal plan exists for that week (empty slots array, not a 404).

| Status | Condition |
|--------|-----------|
| 200 | Success |
| 400 | Invalid week format |
| 401 | Not authenticated |

---

## POST /api/meal-plans/[week]/slots

Assign a recipe to a meal slot. Replaces any existing assignment for the same
`(day, mealType)` pair.

### Request body

```json
{
  "day": "monday",          // required: DayOfWeek
  "mealType": "breakfast",  // required: "breakfast" | "lunch" | "dinner"
  "recipeId": "uuid"        // required: must be an existing, non-deleted recipe
}
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "slot": { "id": "...", "day": "...", "mealType": "...", "recipeId": "..." } }` | Assigned |
| 400 | `{ "error": "Invalid day or mealType" }` | Validation error |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Recipe not found" }` | Recipe does not exist or not owned |

---

## DELETE /api/meal-plans/[week]/slots/[slotId]

Remove a meal slot from the plan.

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "ok": true }` | Removed |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Slot not found" }` | Slot does not exist or not owned |


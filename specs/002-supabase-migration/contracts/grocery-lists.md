# Contract: Grocery Lists API

**Module**: Grocery List Generator | **Base path**: `/api/grocery-lists` | **Date**: 2026-03-14

All requests require an authenticated session cookie.

---

## GET /api/grocery-lists/[week]

Get the grocery list for a specific ISO week.

### Response 200

```json
{
  "groceryList": {
    "isoWeek": "2026-W11",
    "items": [
      {
        "id": "uuid",
        "name": "pasta",
        "quantity": 400,
        "unit": "g",
        "category": "grains_bread",
        "checked": false,
        "isManual": false
      }
    ],
    "generatedAt": "2026-03-14T10:00:00Z",
    "updatedAt": "2026-03-14T10:00:00Z"
  }
}
```

Returns empty items array if no grocery list exists for that week.

| Status | Condition |
|--------|-----------|
| 200 | Success |
| 400 | Invalid week format |
| 401 | Not authenticated |

---

## POST /api/grocery-lists/[week]/generate

Generate (or regenerate) the grocery list from the meal plan for the specified week.
Auto-generated items are replaced; manually added items are preserved.

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "groceryList": { ...full list... } }` | Generated successfully |
| 400 | `{ "error": "No meal plan found for this week" }` | Empty week |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |

---

## POST /api/grocery-lists/[week]/items

Manually add a grocery item to the list.

### Request body

```json
{
  "name": "olive oil",        // required, non-empty
  "quantity": 1,             // required, number >= 0
  "unit": "bottle",          // required
  "category": "other"        // required: FoodCategory value
}
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "item": { ...full item... } }` | Added |
| 400 | `{ "error": "...", "field": "..." }` | Validation error |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |

---

## PATCH /api/grocery-lists/[week]/items/[id]

Toggle the checked state of a grocery item (or un-check it).

### Request body

```json
{
  "checked": true   // required boolean
}
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "item": { ...updated item... } }` | Updated |
| 400 | `{ "error": "checked must be boolean" }` | Validation error |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Item not found" }` | Item does not exist or not owned |

---

## DELETE /api/grocery-lists/[week]/items/[id]

Remove a grocery item from the list (manual items only; auto items are re-generated).

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "ok": true }` | Removed |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Item not found" }` | Item does not exist or not owned |


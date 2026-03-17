# Contract: Recipes API

**Module**: Recipe Manager | **Base path**: `/api/recipes` | **Date**: 2026-03-14

All requests require an authenticated session cookie.
All responses return JSON.

---

## GET /api/recipes

List all non-deleted recipes for the authenticated user.

### Query parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | No | Full-text search across title, ingredients, tags |
| `tags` | string | No | Comma-separated tag filter (AND logic). e.g. `vegan,lunch` |

### Response 200

```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Pasta Carbonara",
      "photoUrl": null,
      "cookTimeMinutes": 30,
      "servings": 4,
      "tags": ["dinner"],
      "ingredients": [
        { "id": "uuid", "name": "pasta", "quantity": 200, "unit": "g" }
      ],
      "steps": [
        { "order": 1, "description": "Boil water..." }
      ],
      "createdAt": "2026-03-14T10:00:00Z",
      "updatedAt": "2026-03-14T10:00:00Z"
    }
  ]
}
```

| Status | Condition |
|--------|-----------|
| 200 | Success (may return empty array) |
| 401 | Not authenticated |

---

## POST /api/recipes

Create a new recipe.

### Request body

```json
{
  "title": "Pasta Carbonara",          // required, non-empty
  "photoUrl": null,                    // optional
  "cookTimeMinutes": 30,               // required, integer >= 0
  "servings": 4,                       // required, integer >= 1
  "tags": ["dinner"],                  // required, can be empty array
  "ingredients": [                     // required, can be empty array
    { "name": "pasta", "quantity": 200, "unit": "g" }
  ],
  "steps": [                           // required, can be empty array
    { "order": 1, "description": "Boil water..." }
  ]
}
```

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "recipe": { ...full recipe object... } }` | Created successfully |
| 400 | `{ "error": "...", "field": "title" }` | Validation error |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |

---

## POST /api/recipes/seed

Copy the 20 seed recipes to the authenticated user's account.
Should only be called once per user (when `seeded === false`).

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 201 | `{ "count": 20 }` | Seed recipes created |
| 200 | `{ "count": 0, "message": "Already seeded" }` | Seeds already exist |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |

---

## GET /api/recipes/[id]

Get a single recipe by ID (must belong to the authenticated user).

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "recipe": { ...full recipe object... } }` | Found |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Recipe not found" }` | Not found, deleted, or belongs to another user |

---

## PUT /api/recipes/[id]

Update a recipe. Partial updates are supported (only changed fields required).

### Request body (all fields optional)

```json
{
  "title": "Updated Title",
  "cookTimeMinutes": 45,
  "servings": 2,
  "tags": ["lunch", "healthy"],
  "ingredients": [ ... ],
  "steps": [ ... ]
}
```

Sending `ingredients` or `steps` replaces the full list for that field.

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "recipe": { ...updated recipe... } }` | Updated |
| 400 | `{ "error": "...", "field": "..." }` | Validation error |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Recipe not found" }` | Not found or not owned |

---

## DELETE /api/recipes/[id]

Soft-delete a recipe (sets `deleted_at` timestamp).

### Responses

| Status | Body | Condition |
|--------|------|-----------|
| 200 | `{ "ok": true }` | Soft-deleted |
| 401 | `{ "error": "Unauthorized" }` | Not authenticated |
| 404 | `{ "error": "Recipe not found" }` | Not found or not owned |


# Contract: Screenshot File Naming Convention

**Feature**: 005-project-docs  
**Type**: Filesystem output contract  
**Version**: 1.0.0

## Purpose

Defines the stable output interface for the screenshot capture task. Any consumer of documentation screenshots (e.g., README.md, future CI badge generation) MUST reference these filenames and paths.

## Output Location

```
docs/
└── screenshots/
    ├── 01-login.png
    ├── 02-recipes-list.png
    ├── 03-recipe-detail.png
    ├── 04-recipe-create.png
    ├── 05-meal-planner.png
    ├── 06-multi-recipe-slot.png
    └── 07-grocery-list.png
```

- **Directory**: `docs/screenshots/` (relative to repo root)
- **Format**: PNG
- **Viewport**: 1280 × 800 pixels
- **Minimum file size**: > 10 KB (enforces non-blank captures)

## File Name Contract

| Filename | Page | Auth | Source State |
|---|---|---|---|
| `01-login.png` | `/login` | Public | Unauthenticated |
| `02-recipes-list.png` | `/recipes` | Required | ≥1 recipe in DB |
| `03-recipe-detail.png` | `/recipes/:id` | Required | Valid recipe with ingredients + steps |
| `04-recipe-create.png` | `/recipes/new` | Required | Empty form (pre-submission) |
| `05-meal-planner.png` | `/meal-planner` | Required | ≥1 recipe assigned to a slot |
| `06-multi-recipe-slot.png` | `/meal-planner` | Required | ≥2 recipes in a single slot (spec 004 demo) |
| `07-grocery-list.png` | `/grocery-list` | Required | Grocery list generated from meal plan |

## Versioning

- Breaking changes (filename renames, directory moves) require updating `README.md` image references.
- Additive changes (new screenshots) MUST use sequential `NN-` prefixes.
- This contract is referenced by `README.md` via relative paths: `./docs/screenshots/{filename}`.

## README Section Contract

The `## Screenshots` section in `README.md` MUST reference files in this exact order:

```markdown
## Screenshots

### Login
![Login page](./docs/screenshots/01-login.png)

### Recipe Collection
![Recipes list](./docs/screenshots/02-recipes-list.png)

### Recipe Detail
![Recipe detail](./docs/screenshots/03-recipe-detail.png)

### Create Recipe
![Create recipe form](./docs/screenshots/04-recipe-create.png)

### Meal Planner
![Meal planner grid](./docs/screenshots/05-meal-planner.png)

### Multi-Recipe Slot
![Multi-recipe slot](./docs/screenshots/06-multi-recipe-slot.png)

### Grocery List
![Grocery list](./docs/screenshots/07-grocery-list.png)
```

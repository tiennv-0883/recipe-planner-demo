# Data Model: Project Documentation with Screenshots

**Branch**: `005-project-docs` | **Phase**: 1 | **Date**: 2026-03-17

## Overview

This feature produces no new database entities or TypeScript types. It generates **filesystem artifacts** (screenshots + updated README) from the existing running application.

## Filesystem Artifacts

### Screenshots Directory

**Path**: `docs/screenshots/`  
**Format**: PNG, 1280×800 viewport  
**Lifecycle**: Overwrite on re-capture; created automatically if missing

| Filename | Description | Source URL |
|---|---|---|
| `01-login.png` | Login page (public, no auth) | `/login` |
| `02-recipes-list.png` | Recipe collection list view | `/recipes` |
| `03-recipe-detail.png` | Single recipe detail page | `/recipes/:id` |
| `04-recipe-create.png` | New recipe creation form | `/recipes/new` |
| `05-meal-planner.png` | Weekly meal planner grid | `/meal-planner` |
| `06-multi-recipe-slot.png` | Meal planner with 2+ recipes in one slot | `/meal-planner` (seeded) |
| `07-grocery-list.png` | Generated grocery list view | `/grocery-list` |

### README.md

**Path**: `README.md` (repo root)  
**Lifecycle**: Updated in-place, preserving existing content structure  

**Required sections** (post-update):

| Section | Action | Position |
|---|---|---|
| `# Recipe Planner` | Keep | Top |
| `## Features` | Update — add multi-recipe slots bullet | 1st |
| `## Screenshots` | **Add new** | After Features |
| `## Tech Stack` | Keep | After Screenshots |
| `## Local Setup` | Keep + extend env var table | After Tech Stack |
| `## Environment Variables` | **Add new** | After Local Setup |
| `## Project Structure` | Keep | After Env Vars |
| `## Running Tests` | Keep | After Project Structure |
| `## Deployment (Vercel)` | Keep | Last |

## State Transitions

```
[Pre-condition]
  docs/screenshots/ missing OR stale
  README.md has no Screenshots section
  README.md has no Environment Variables section

[Post-condition]  
  docs/screenshots/ contains 7 PNG files (>10 KB each)
  README.md has Screenshots section with 7 inline images
  README.md has Environment Variables section with required table
  README.md Features list mentions multi-recipe meal slots
```

## No Schema Changes

No database migrations, TypeScript type changes, or API contract changes are introduced by this feature. This feature is documentation-only.

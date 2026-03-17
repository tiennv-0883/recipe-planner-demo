# Quickstart: Capturing Screenshots and Updating README

**Branch**: `005-project-docs` | **Date**: 2026-03-17

## Prerequisites

Before starting, ensure:

1. **Dev server running**: `npm run dev` → `http://localhost:3000`
2. **Account exists**: At least one Supabase user account registered
3. **Recipe data**: At least 3 recipes in the database (auto-seeded on first login)
4. **Meal plan data**: At least 1 recipe assigned to a meal slot, and at least 2 recipes assigned to *the same* slot (for screenshot 06)
5. **Grocery list generated**: At least one grocery list generated for the current week
6. **VS Code in Agent mode**: Playwright MCP only works in Agent mode, not Ask/Chat

## Step 1: Prepare Browser Context

Open VS Code in Agent mode. The Playwright MCP browser will be launched by the agent on first navigation.

## Step 2: Run Screenshot Capture (via Copilot Agent)

Invoke the implementation tasks. The agent will:

1. Navigate to `http://localhost:3000/login` and capture `01-login.png`
2. Fill the login form with your credentials and submit
3. Navigate to `/recipes` → capture `02-recipes-list.png`
4. Navigate to `/recipes/:id` (first recipe) → capture `03-recipe-detail.png`
5. Navigate to `/recipes/new` → capture `04-recipe-create.png`
6. Navigate to `/meal-planner` → capture `05-meal-planner.png`
7. Navigate to `/meal-planner` (with multi-recipe slot in view) → capture `06-multi-recipe-slot.png`
8. Navigate to `/grocery-list` → capture `07-grocery-list.png`

> **Note**: For screenshot 06, manually add a second recipe to any meal slot before the agent captures it, or let the agent use the "Add recipe" button in the meal planner.

## Step 3: Verify Screenshot Output

```bash
ls -lh docs/screenshots/
```

Expected output: 7 files, each > 10 KB:
```
01-login.png
02-recipes-list.png
03-recipe-detail.png
04-recipe-create.png
05-meal-planner.png
06-multi-recipe-slot.png
07-grocery-list.png
```

## Step 4: README Update (via Copilot Agent)

The agent updates `README.md` with:
- Updated Features list (multi-recipe slots added)
- New `## Screenshots` section with inline images
- New `## Environment Variables` section with full table

## Step 5: Verify README Renders Correctly

```bash
# Start dev server and view README in VS Code Markdown preview
# OR push branch to GitHub and view README.md on GitHub
```

Verify:
- All 7 screenshots render inline (not as broken image links)
- All 5 sections are present: Features, Screenshots, Tech Stack, Local Setup, Environment Variables
- No real secrets are included in the env var table

## Re-capture a Single Screenshot

To refresh one specific screenshot after a UI change:

1. Open VS Code in Agent mode
2. Ask Copilot to navigate to the specific page and re-capture that screenshot
3. The Playwright MCP will overwrite the existing PNG file

## Troubleshooting

| Problem | Solution |
|---|---|
| Dev server not running | Run `npm run dev` in a terminal first |
| Login fails | Check Supabase credentials in `.env.local` |
| Screenshots appear blank | Wait for page to fully load; check if JS hydration completed |
| Multi-recipe slot empty | Manually add 2+ recipes to one meal slot before capture |
| MCP tools unavailable | Switch VS Code from Ask mode to Agent mode |
| `docs/screenshots/` not created | Agent creates it automatically; if it fails, run `mkdir -p docs/screenshots` |

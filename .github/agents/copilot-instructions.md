# recipe-planner Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-17

## Active Technologies

- TypeScript 5.x / Node.js 20.x (Vercel runtime) (002-supabase-migration)
- Supabase PostgreSQL (hosted, free tier) (002-supabase-migration)
- TypeScript 5.x stric + Next.js 15 App Router, `@supabase/supabase-js`, `@supabase/ssr`, React 18, Tailwind CSS (003-recipe-image-upload)
- Supabase Storage bucket `recipe-images` (public) + existing `recipes.photo_url` PostgreSQL column (003-recipe-image-upload)
- TypeScript 5 (strict), Next.js 15 App Router + Supabase (PostgreSQL + RLS), `@supabase/ssr`, React 19, Tailwind CSS, Jest 29 (004-multi-recipe-meal-slots)
- Supabase PostgreSQL — new junction table `meal_slot_recipes`; `meal_slots.recipe_id` made nullable (deprecation) then dropped in a follow-up migration (004-multi-recipe-meal-slots)
- Playwright MCP (`@playwright/mcp@latest` via `.vscode/mcp.json`) for browser automation screenshot capture (005-project-docs)
- TypeScript 5.x / Node.js 20 + Next.js 15 (App Router, `output: 'export'`), Tailwind CSS 3, React 19 (001-recipe-planner-app)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x / Node.js 20: Follow standard conventions

## Recent Changes

- 005-project-docs: Added Playwright MCP (`@playwright/mcp@latest`) for browser automation + screenshot capture; documentation artifacts in `docs/screenshots/` (PNG) and `README.md`
- 004-multi-recipe-meal-slots: Added TypeScript 5 (strict), Next.js 15 App Router + Supabase (PostgreSQL + RLS), `@supabase/ssr`, React 19, Tailwind CSS, Jest 29
- 004-multi-recipe-meal-slots: Added TypeScript 5 (strict), Next.js 15 App Router + Supabase (PostgreSQL + RLS), `@supabase/ssr`, React 19, Tailwind CSS, Jest 29

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

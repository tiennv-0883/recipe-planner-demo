# Quickstart: Supabase Backend Migration

**Date**: 2026-03-14 | **Audience**: Developer environment setup

This guide covers everything needed to run the migrated app locally and deploy
to Vercel. Complete these steps before implementing any task from tasks.md.

---

## Prerequisites

- Node.js 20.x
- npm 10.x
- A Supabase account (supabase.com) -- free tier is sufficient
- A Vercel account (vercel.com) -- free hobby tier is sufficient
- Git, GitHub account

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose a name (e.g. `recipe-planner`), region, and database password.
4. Wait ~2 minutes for the project to provision.
5. From the project dashboard, go to **Project Settings > API** and copy:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon / public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`)

---

## Step 2: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**.
2. Open `supabase/migrations/001_initial_schema.sql` from this repo.
3. Paste the full contents into the SQL Editor and click **Run**.
4. Verify the tables appear in **Table Editor**: `user_profiles`, `recipes`,
   `ingredient_lines`, `preparation_steps`, `meal_plans`, `meal_slots`,
   `grocery_lists`, `grocery_items`.

---

## Step 3: Set Up Local Environment

```bash
# Clone / checkout the branch
git checkout 002-supabase-migration

# Install dependencies
npm install

# Install Supabase packages
npm install @supabase/supabase-js @supabase/ssr
```

Create `.env.local` in the project root (never commit this file):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Expected behaviour:
- Root `/` redirects to `/login` (unauthenticated).
- Register a new account -- you are redirected to Dashboard.
- 20 seed recipes are copied to your account on first login.
- All 5 features (recipes, meal planner, grocery list, search, dashboard) work.

---

## Step 5: Run Tests

```bash
# All existing unit tests must still pass
npx jest tests/unit --no-coverage --forceExit

# New API route tests
npx jest tests/api --no-coverage --forceExit
```

Expected: all tests green, no regressions.

---

## Step 6: Deploy to Vercel

1. Push the branch to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the GitHub repo.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**.
5. Vercel assigns a URL like `https://recipe-planner-xxx.vercel.app`.
6. Smoke test at the public URL:
   - Register a new account
   - Create a recipe
   - Assign it to a meal plan slot
   - Generate the grocery list
   - Log out and log back in -- all data persists

---

## Key Configuration Changes

| File | Change | Reason |
|------|--------|--------|
| `next.config.ts` | Remove `output: 'export'` | Required for API Routes (research R-003) |
| `.env.local` | Add Supabase env vars | Supabase client configuration |
| `middleware.ts` | Add session refresh middleware | Session cookie management (research R-001) |

---

## Troubleshooting

**"Unauthorized" on all API calls**
- Check that `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Ensure `middleware.ts` is at the repo root (not inside `src/`).

**"relation recipes does not exist"**
- SQL migration has not been run. Go to Supabase SQL Editor and run
  `supabase/migrations/001_initial_schema.sql`.

**Seed recipes not appearing**
- Check that `POST /api/recipes/seed` was called after first login.
- Verify `user_profiles.seeded_at` is NULL in Supabase Table Editor for the user.

**Build error on Vercel**
- Ensure `output: 'export'` is removed from `next.config.ts`.
- Check all three environment variables are set in Vercel dashboard.

**TypeScript errors in tests**
- Run `npx tsc --noEmit` to see type errors.
- Route Handler tests need `@types/jest` and `jest-environment-node` in jest config.

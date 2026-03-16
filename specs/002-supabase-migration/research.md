# Research: Supabase Backend Migration

**Phase**: 0 | **Date**: 2026-03-14 | **Status**: Complete

All NEEDS CLARIFICATION items from Technical Context resolved below.

---

## R-001: Supabase Auth + Next.js 15 App Router Integration

**Context**: How should Supabase Auth sessions be managed in Next.js 15 App Router with
Route Handlers and `middleware.ts`?

**Decision**: Use `@supabase/ssr` (the official Next.js integration package).

**Rationale**:
- `@supabase/ssr` stores the Supabase session in HTTP cookies rather than localStorage,
  making it accessible in both server components and Route Handlers.
- The package provides `createServerClient()` (for Route Handlers and Server Components)
  and `createBrowserClient()` (for Client Components).
- `middleware.ts` at the repo root intercepts every request, calls
  `supabase.auth.getUser()` to refresh the session cookie, then redirects unauthenticated
  requests to `/login`.
- This is the officially recommended approach per Supabase docs for Next.js App Router.

**Alternatives considered**:
- `@supabase/auth-helpers-nextjs` (deprecated, superseded by `@supabase/ssr`)
- `next-auth` with Supabase adapter (unnecessary complexity for email/password only)
- Direct `@supabase/supabase-js` without SSR (session lost on server-side rendering)

**Packages needed**: `@supabase/supabase-js`, `@supabase/ssr`

---

## R-002: Route Handlers vs. Server Actions

**Context**: Should data mutations use Next.js Route Handlers (`app/api/`) or
Server Actions?

**Decision**: Route Handlers (`app/api/`).

**Rationale**:
- Route Handlers produce proper REST endpoints that are independently testable with
  `fetch` in unit tests (no need for Next.js-specific test harnesses).
- Server Actions are tied to React Server Components and harder to unit-test in
  isolation.
- The constitution requires RESTful API with JSON as data-exchange format; Route
  Handlers directly satisfy this.
- The existing service layer (pure functions) is easily called from Route Handler
  request/response bodies.

**Alternatives considered**:
- Server Actions: simpler calling convention from Client Components, but harder to test,
  not a standard REST API, and complicates auth header validation.

---

## R-003: `output: 'export'` Removal Impact

**Context**: The current `next.config.ts` has `output: 'export'` (static HTML export).
Route Handlers require a Node.js server runtime -- incompatible with static export.

**Decision**: Remove `output: 'export'` from `next.config.ts`. Deploy on Vercel (default
Node.js runtime).

**Rationale**:
- Next.js static export (`output: 'export'`) pre-renders all pages to HTML at build
  time. It prohibits any server-side runtime code (Route Handlers, middleware, Server
  Components that fetch data at request time).
- Vercel's default deployment mode for Next.js is the Node.js runtime, which supports
  all App Router features (Route Handlers, middleware, SSR, ISR).
- Removing `output: 'export'` fixes BUG-001 as a side-effect: `generateStaticParams()`
  is only needed for static export. With SSR, dynamic `[id]` routes are rendered
  on-demand without needing a static ID list.

**Impact on existing pages**:
- All pages using `'use client'` and `useParams()` continue to work unchanged.
- `generateStaticParams()` calls can be removed from recipe detail and edit pages.
- No other pages use `getStaticProps` / `getServerSideProps` (App Router patterns only).

**Alternatives considered**:
- Keep `output: 'export'` and deploy API Routes as separate serverless functions:
  overly complex, not supported by Vercel's static export mode natively.
- Use a separate Express/Fastify backend: breaks the monolith constraint, adds
  infrastructure overhead unjustified for demo scale.

---

## R-004: Row Level Security (RLS) Patterns

**Context**: How to write Supabase RLS policies so that each user can only access their
own rows?

**Decision**: Enable RLS on every table. Use `auth.uid() = user_id` policies.

**Patterns**:

```sql
-- Standard per-user policy pattern (applied to all tables)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_recipes" ON recipes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

For child tables (ingredient_lines, preparation_steps, meal_slots, grocery_items)
that don't have a direct `user_id`, join through the parent:

```sql
CREATE POLICY "users_own_ingredient_lines" ON ingredient_lines
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
        AND recipes.user_id = auth.uid()
    )
  );
```

**Route Handler auth pattern** (defence-in-depth, validates session before any DB call):

```typescript
// Every Route Handler starts with:
const supabase = createServerClient(...)
const { data: { user }, error } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Rationale**: Two-layer security -- Route Handler auth check (fast, returns 401 before
DB query) + RLS (database-level, bulletproof even if application logic is bypassed).

---

## R-005: Seed Data Strategy (20 Recipes on First Login)

**Context**: The current app has 20 hard-coded mock recipes in `src/data/recipes.ts`.
How do we make them available to every new user in Supabase without a global shared
table?

**Decision**: Seed via a `/api/recipes/seed` Route Handler that is called client-side
immediately after the first successful login.

**Implementation**:
1. After successful login, the auth flow calls `GET /api/auth/me` which returns user
   profile + a `{ seeded: boolean }` flag.
2. If `seeded === false`, the client calls `POST /api/recipes/seed`.
3. The seed endpoint uses `SUPABASE_SERVICE_ROLE_KEY` to insert the 20 mock recipes
   with `user_id = current_user.id` bypassing RLS.
4. Mark the user as seeded in a `user_profiles` table (`seeded_at` timestamp).

**Rationale**:
- Supabase database triggers require the `pg_net` extension or Edge Functions for
  HTTP calls -- adds complexity for demo.
- Seed via Route Handler keeps all seeding logic in TypeScript where it's testable.
- `user_profiles` table also stores display preferences if needed later.

**Alternatives considered**:
- Supabase database trigger (`AFTER INSERT ON auth.users`): requires Supabase Edge
  Functions or pg_net, harder to test, requires knowing user's desired seed data at
  DB level.
- Shared global recipes table: violates data isolation (Principle I + FR-011).

---

## R-006: BUG-001 -- `generateStaticParams` + `'use client'` Conflict

**Context**: `src/app/recipes/[id]/page.tsx` is `'use client'` and has no
`generateStaticParams()`, causing build failure with `output: 'export'`.

**Decision**: Fix as part of this migration by removing `output: 'export'` (R-003).
The detail and edit pages become server-rendered; `generateStaticParams()` is not
needed. `useParams()` continues to work in Client Components.

**Alternative if static export were kept**: Split each page into a Server Component
(exports `generateStaticParams()`) wrapping a Client Component (holds all hooks).
This is NOT needed since we are removing `output: 'export'`.

---

## R-007: Environment Variables for Supabase

**Required variables**:

```bash
# .env.local (never committed)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>          # safe to expose in browser
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>       # server-side only (seed endpoint)
```

**Vercel**: Add same variables in Project Settings > Environment Variables.
`NEXT_PUBLIC_*` vars are embedded in the browser bundle at build time.
`SUPABASE_SERVICE_ROLE_KEY` is server-side only -- never prefixed with `NEXT_PUBLIC_`.

---

## R-008: Testing Strategy for Route Handlers

**Decision**: Unit-test Route Handlers by mocking `@supabase/ssr` at the module level
with Jest. No real database connection required for unit tests.

**Pattern**:

```typescript
jest.mock('@/src/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(() => ({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
    from: jest.fn(() => ({ select: jest.fn(), insert: jest.fn(), ... }))
  }))
}))
```

Integration tests (optional, not required for spec 002) would use a dedicated Supabase
test project with the `supabase` CLI.

---

## R-009: Vercel Deployment Checklist

1. Push branch to GitHub; connect repo to Vercel.
2. Add environment variables in Vercel dashboard.
3. Set Node.js version to 20.x in Vercel project settings.
4. Run SQL migration in Supabase dashboard (SQL Editor) before first deploy.
5. First deploy: Vercel builds Next.js app, deploys to `https://<project>.vercel.app`.
6. Smoke test: register, create recipe, check meal plan, check grocery list.


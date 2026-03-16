-- ============================================================
-- 001_initial_schema.sql
-- Recipe Planner – full schema + RLS
-- Run once in Supabase SQL Editor before first deploy
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── user_profiles ────────────────────────────────────────────
create table if not exists public.user_profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  seeded_at   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.user_profiles enable row level security;
create policy "user_owns_profile" on public.user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── recipes ──────────────────────────────────────────────────
create table if not exists public.recipes (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  title               text        not null check (length(title) >= 1),
  photo_url           text,
  cook_time_minutes   integer     not null check (cook_time_minutes >= 0),
  servings            integer     not null check (servings >= 1),
  tags                text[]      not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);
create index if not exists recipes_user_id_idx on public.recipes(user_id);
create index if not exists recipes_deleted_at_idx on public.recipes(deleted_at) where deleted_at is null;

alter table public.recipes enable row level security;
create policy "user_owns_recipes" on public.recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── ingredient_lines ─────────────────────────────────────────
create table if not exists public.ingredient_lines (
  id          uuid    primary key default gen_random_uuid(),
  recipe_id   uuid    not null references public.recipes(id) on delete cascade,
  name        text    not null check (length(name) >= 1),
  quantity    numeric(10,3) not null check (quantity > 0),
  unit        text    not null,
  sort_order  integer not null default 0
);
create index if not exists ingredient_lines_recipe_id_idx on public.ingredient_lines(recipe_id);

alter table public.ingredient_lines enable row level security;
create policy "user_owns_ingredient_lines" on public.ingredient_lines
  for all using (
    exists (
      select 1 from public.recipes
      where recipes.id = ingredient_lines.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

-- ── preparation_steps ────────────────────────────────────────
create table if not exists public.preparation_steps (
  id          uuid    primary key default gen_random_uuid(),
  recipe_id   uuid    not null references public.recipes(id) on delete cascade,
  step_order  integer not null,
  description text    not null check (length(description) >= 1),
  unique (recipe_id, step_order)
);
create index if not exists preparation_steps_recipe_id_idx on public.preparation_steps(recipe_id);

alter table public.preparation_steps enable row level security;
create policy "user_owns_preparation_steps" on public.preparation_steps
  for all using (
    exists (
      select 1 from public.recipes
      where recipes.id = preparation_steps.recipe_id
        and recipes.user_id = auth.uid()
    )
  );

-- ── meal_plans ───────────────────────────────────────────────
create table if not exists public.meal_plans (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  iso_week    text        not null,
  updated_at  timestamptz not null default now(),
  unique (user_id, iso_week)
);
create index if not exists meal_plans_user_id_idx on public.meal_plans(user_id);

alter table public.meal_plans enable row level security;
create policy "user_owns_meal_plans" on public.meal_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── meal_slots ───────────────────────────────────────────────
create table if not exists public.meal_slots (
  id            uuid  primary key default gen_random_uuid(),
  meal_plan_id  uuid  not null references public.meal_plans(id) on delete cascade,
  day           text  not null,
  meal_type     text  not null,
  recipe_id     uuid  not null references public.recipes(id) on delete cascade,
  unique (meal_plan_id, day, meal_type)
);
create index if not exists meal_slots_meal_plan_id_idx on public.meal_slots(meal_plan_id);

alter table public.meal_slots enable row level security;
create policy "user_owns_meal_slots" on public.meal_slots
  for all using (
    exists (
      select 1 from public.meal_plans
      where meal_plans.id = meal_slots.meal_plan_id
        and meal_plans.user_id = auth.uid()
    )
  );

-- ── grocery_lists ────────────────────────────────────────────
create table if not exists public.grocery_lists (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  iso_week      text        not null,
  generated_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (user_id, iso_week)
);
create index if not exists grocery_lists_user_id_idx on public.grocery_lists(user_id);

alter table public.grocery_lists enable row level security;
create policy "user_owns_grocery_lists" on public.grocery_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── grocery_items ────────────────────────────────────────────
create table if not exists public.grocery_items (
  id                uuid    primary key default gen_random_uuid(),
  grocery_list_id   uuid    not null references public.grocery_lists(id) on delete cascade,
  name              text    not null,
  quantity          numeric(10,3) not null check (quantity >= 0),
  unit              text    not null,
  category          text    not null,
  checked           boolean not null default false,
  is_manual         boolean not null default false
);
create index if not exists grocery_items_list_id_idx on public.grocery_items(grocery_list_id);

alter table public.grocery_items enable row level security;
create policy "user_owns_grocery_items" on public.grocery_items
  for all using (
    exists (
      select 1 from public.grocery_lists
      where grocery_lists.id = grocery_items.grocery_list_id
        and grocery_lists.user_id = auth.uid()
    )
  );

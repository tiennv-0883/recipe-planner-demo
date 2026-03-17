-- ============================================================
-- Migration 003: Multi-Recipe Meal Slots
-- Adds meal_slot_recipes junction table.
-- Migrates existing meal_slots.recipe_id data into it.
-- Makes meal_slots.recipe_id nullable (deprecation period).
-- recipe_id column HARD DROP deferred to spec 005.
-- ============================================================

-- 1. Junction table
CREATE TABLE public.meal_slot_recipes (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id    uuid    NOT NULL REFERENCES public.meal_slots(id) ON DELETE CASCADE,
  recipe_id  uuid    NOT NULL REFERENCES public.recipes(id)    ON DELETE CASCADE,
  position   integer NOT NULL DEFAULT 0,
  UNIQUE (slot_id, recipe_id)
);

CREATE INDEX meal_slot_recipes_slot_id_idx ON public.meal_slot_recipes(slot_id);

-- 2. Row Level Security
ALTER TABLE public.meal_slot_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_owns_meal_slot_recipes"
  ON public.meal_slot_recipes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM   public.meal_slots  ms
      JOIN   public.meal_plans  mp ON mp.id = ms.meal_plan_id
      WHERE  ms.id = meal_slot_recipes.slot_id
        AND  mp.user_id = auth.uid()
    )
  );

-- 3. Migrate existing data (preserves current single-recipe assignments)
INSERT INTO public.meal_slot_recipes (slot_id, recipe_id, position)
SELECT  id, recipe_id, 0
FROM    public.meal_slots
WHERE   recipe_id IS NOT NULL;

-- 4. Deprecate old column — NOT dropped yet (follow-up in spec 005)
ALTER TABLE public.meal_slots ALTER COLUMN recipe_id DROP NOT NULL;

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { toDomainMealPlan, toDomainRecipe, toDomainGroceryList } from '@/src/lib/supabase/mappers'
import { generateGroceryList } from '@/src/services/groceryList'
import type { Recipe } from '@/src/types'
import type { FoodCategory } from '@/src/types'

type RouteParams = { params: Promise<{ week: string }> }

/**
 * POST /api/grocery-lists/[week]/generate
 * Generates a grocery list from the current meal plan.
 * Replaces auto-generated items; preserves manual items and their checked state.
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { week } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 1. Fetch the meal plan for this week
  const { data: planData } = await supabase
    .from('meal_plans')
    .select('*, meal_slots(*, meal_slot_recipes(*))')
    .eq('user_id', user.id)
    .eq('iso_week', week)
    .maybeSingle()

  const mealPlan = planData ? toDomainMealPlan(planData) : { isoWeek: week, slots: [], updatedAt: new Date().toISOString() }

  // 2. Fetch all recipes referenced by the meal plan
  const recipeIds = [...new Set(mealPlan.slots.flatMap((s) => s.recipeIds))]
  const recipesById: Record<string, Recipe> = {}

  if (recipeIds.length > 0) {
    const { data: recipeRows } = await supabase
      .from('recipes')
      .select('*, ingredient_lines(*), preparation_steps(*)')
      .in('id', recipeIds)
      .eq('user_id', user.id)

    for (const row of recipeRows ?? []) {
      const recipe = toDomainRecipe(row)
      recipesById[recipe.id] = recipe
    }
  }

  // 3. Generate new grocery list via the pure service function
  const generated = generateGroceryList(mealPlan, recipesById)

  // 4. Find or create grocery_lists row
  let { data: listRow } = await supabase
    .from('grocery_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('iso_week', week)
    .maybeSingle()

  if (!listRow) {
    const { data: newList } = await supabase
      .from('grocery_lists')
      .insert({ user_id: user.id, iso_week: week })
      .select('id')
      .single()
    listRow = newList
  }

  if (!listRow) return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })

  // 5. Delete existing auto-generated items, keep manual ones
  await supabase
    .from('grocery_items')
    .delete()
    .eq('grocery_list_id', listRow.id)
    .eq('is_manual', false)

  // 6. Insert new auto-generated items
  if (generated.items.length > 0) {
    await supabase.from('grocery_items').insert(
      generated.items.map((item) => ({
        grocery_list_id: listRow!.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category as FoodCategory,
        checked: false,
        is_manual: false,
      })),
    )
  }

  // 7. Update generated_at on the list row
  await supabase
    .from('grocery_lists')
    .update({ generated_at: generated.generatedAt, updated_at: generated.updatedAt })
    .eq('id', listRow.id)

  // 8. Return full updated list
  const { data: full } = await supabase
    .from('grocery_lists')
    .select('*, grocery_items(*)')
    .eq('id', listRow.id)
    .single()

  return NextResponse.json(
    { groceryList: full ? toDomainGroceryList(full) : null },
    { status: 201 },
  )
}

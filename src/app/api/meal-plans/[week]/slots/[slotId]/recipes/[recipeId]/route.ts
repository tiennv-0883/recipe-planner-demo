import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

type RouteParams = {
  params: Promise<{ week: string; slotId: string; recipeId: string }>
}

/**
 * DELETE /api/meal-plans/[week]/slots/[slotId]/recipes/[recipeId]
 * Removes a single recipe from a meal slot.
 * If no recipes remain in the slot, the meal_slots row is also deleted.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { slotId, recipeId } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership by joining through meal_plans
  const { data: slot } = await supabase
    .from('meal_slots')
    .select('id, meal_plan_id, meal_plans!inner(user_id)')
    .eq('id', slotId)
    .maybeSingle()

  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const plan = slot.meal_plans as unknown as { user_id: string }
  if (plan.user_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Delete the single recipe from the junction table
  const { error, count } = await supabase
    .from('meal_slot_recipes')
    .delete({ count: 'exact' })
    .eq('slot_id', slotId)
    .eq('recipe_id', recipeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (count === 0)
    return NextResponse.json({ error: 'RECIPE_NOT_IN_SLOT' }, { status: 404 })

  // Count remaining recipes in this slot
  const { count: remaining } = await supabase
    .from('meal_slot_recipes')
    .select('id', { count: 'exact', head: true })
    .eq('slot_id', slotId)

  // Auto-clean: remove the slot row if no recipes remain
  if ((remaining ?? 0) === 0) {
    await supabase.from('meal_slots').delete().eq('id', slotId)
  }

  return new NextResponse(null, { status: 204 })
}

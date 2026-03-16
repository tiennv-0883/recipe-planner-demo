import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { toDomainMealPlan } from '@/src/lib/supabase/mappers'
import type { DayOfWeek, MealType } from '@/src/types'

type RouteParams = { params: Promise<{ week: string }> }

const VALID_DAYS: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]
const VALID_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']

/**
 * POST /api/meal-plans/[week]/slots
 * Assigns (or re-assigns) a recipe to a day + mealType slot.
 * Creates the meal_plans row if it does not yet exist.
 * Body: { day, mealType, recipeId }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { week } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { day: DayOfWeek; mealType: MealType; recipeId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { day, mealType, recipeId } = body
  if (!VALID_DAYS.includes(day))
    return NextResponse.json({ error: `Invalid day: ${day}` }, { status: 400 })
  if (!VALID_MEAL_TYPES.includes(mealType))
    return NextResponse.json({ error: `Invalid mealType: ${mealType}` }, { status: 400 })
  if (!recipeId)
    return NextResponse.json({ error: 'recipeId is required' }, { status: 400 })

  // Find or create the meal_plans row
  let { data: plan } = await supabase
    .from('meal_plans')
    .select('id')
    .eq('user_id', user.id)
    .eq('iso_week', week)
    .maybeSingle()

  if (!plan) {
    const { data: newPlan, error: createErr } = await supabase
      .from('meal_plans')
      .insert({ user_id: user.id, iso_week: week })
      .select('id')
      .single()

    if (createErr || !newPlan)
      return NextResponse.json({ error: createErr?.message ?? 'Failed to create plan' }, { status: 500 })
    plan = newPlan
  }

  // Upsert the slot (delete old one for same day+mealType, insert new)
  await supabase
    .from('meal_slots')
    .delete()
    .eq('meal_plan_id', plan.id)
    .eq('day', day)
    .eq('meal_type', mealType)

  // Let Supabase generate the UUID via gen_random_uuid()
  const { error: slotErr } = await supabase.from('meal_slots').insert({
    meal_plan_id: plan.id,
    day,
    meal_type: mealType,
    recipe_id: recipeId,
  })

  if (slotErr)
    return NextResponse.json({ error: slotErr.message }, { status: 500 })

  // Update meal_plans.updated_at
  await supabase
    .from('meal_plans')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', plan.id)

  // Return full updated plan
  const { data: full } = await supabase
    .from('meal_plans')
    .select('*, meal_slots(*)')
    .eq('id', plan.id)
    .single()

  return NextResponse.json(
    { mealPlan: full ? toDomainMealPlan(full) : null },
    { status: 201 },
  )
}

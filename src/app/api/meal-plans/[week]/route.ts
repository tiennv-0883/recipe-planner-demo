import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { toDomainMealPlan } from '@/src/lib/supabase/mappers'
import type { MealPlan } from '@/src/types'

type RouteParams = { params: Promise<{ week: string }> }

function emptyPlan(isoWeek: string): MealPlan {
  return { isoWeek, slots: [], updatedAt: new Date().toISOString() }
}

/**
 * GET /api/meal-plans/[week]
 * Returns the meal plan (with slots) for the given ISO week.
 * Returns an empty plan (not 404) if no plan exists yet.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { week } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, meal_slots(*, meal_slot_recipes(*))')
    .eq('user_id', user.id)
    .eq('iso_week', week)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data) {
    return NextResponse.json({ mealPlan: emptyPlan(week) })
  }

  return NextResponse.json({ mealPlan: toDomainMealPlan(data) })
}

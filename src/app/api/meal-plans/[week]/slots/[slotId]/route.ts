import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

type RouteParams = { params: Promise<{ week: string; slotId: string }> }

/**
 * DELETE /api/meal-plans/[week]/slots/[slotId]
 * Removes a single meal slot from the authenticated user's plan.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { slotId } = await params
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

  // TypeScript shape from Supabase join
  const plan = slot.meal_plans as unknown as { user_id: string }
  if (plan.user_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('meal_slots').delete().eq('id', slotId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}

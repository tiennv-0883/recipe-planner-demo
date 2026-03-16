import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { toDomainGroceryList } from '@/src/lib/supabase/mappers'

type RouteParams = { params: Promise<{ week: string }> }

/**
 * GET /api/grocery-lists/[week]
 * Returns the grocery list (with items) for the given ISO week.
 * Returns an empty list (not 404) if no list exists.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { week } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('grocery_lists')
    .select('*, grocery_items(*)')
    .eq('user_id', user.id)
    .eq('iso_week', week)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!data) {
    return NextResponse.json({
      groceryList: { isoWeek: week, items: [], generatedAt: null, updatedAt: new Date().toISOString() },
    })
  }

  return NextResponse.json({ groceryList: toDomainGroceryList(data) })
}

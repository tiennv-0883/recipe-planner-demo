import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { toDomainGroceryList } from '@/src/lib/supabase/mappers'
import type { FoodCategory } from '@/src/types'

type RouteParams = { params: Promise<{ week: string }> }

/**
 * POST /api/grocery-lists/[week]/items
 * Adds a manual grocery item to the list.
 * Creates the grocery_lists row if it doesn't exist.
 * Body: { name, quantity, unit, category }
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { week } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name: string; quantity: number; unit: string; category: FoodCategory }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name?.trim())
    return NextResponse.json({ error: 'name is required' }, { status: 400 })

  // Find or create the grocery_lists row
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

  // Insert the manual item
  const { error: itemErr } = await supabase.from('grocery_items').insert({
    grocery_list_id: listRow.id,
    name: body.name.trim(),
    quantity: body.quantity ?? 1,
    unit: body.unit ?? '',
    category: body.category ?? 'other',
    checked: false,
    is_manual: true,
  })

  if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 500 })

  // Return full updated list
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

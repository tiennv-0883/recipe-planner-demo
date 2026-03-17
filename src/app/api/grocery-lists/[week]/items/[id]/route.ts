import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

type RouteParams = { params: Promise<{ week: string; id: string }> }

/**
 * PATCH /api/grocery-lists/[week]/items/[id]
 * Toggles the `checked` boolean on a grocery item.
 * Body: { checked: boolean }
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { checked: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Verify ownership via join
  const { data: item } = await supabase
    .from('grocery_items')
    .select('id, grocery_list_id, grocery_lists!inner(user_id)')
    .eq('id', id)
    .maybeSingle()

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const list = item.grocery_lists as unknown as { user_id: string }
  if (list.user_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('grocery_items')
    .update({ checked: body.checked })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

/**
 * DELETE /api/grocery-lists/[week]/items/[id]
 * Removes a grocery item (manual or auto-generated).
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: item } = await supabase
    .from('grocery_items')
    .select('id, grocery_list_id, grocery_lists!inner(user_id)')
    .eq('id', id)
    .maybeSingle()

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const list = item.grocery_lists as unknown as { user_id: string }
  if (list.user_id !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase.from('grocery_items').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}

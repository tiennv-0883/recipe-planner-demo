import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import {
  toDomainRecipe,
  toDbRecipeInsert,
  toDbIngredientInsert,
  toDbPreparationStepInsert,
} from '@/src/lib/supabase/mappers'
import type { Recipe } from '@/src/types'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/recipes/[id]
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('recipes')
    .select('*, ingredient_lines(*), preparation_steps(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (error || !data)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ recipe: toDomainRecipe(data) })
}

/**
 * PUT /api/recipes/[id]
 * Full replace — re-inserts all child rows.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.title?.trim())
    return NextResponse.json({ error: 'title is required' }, { status: 400 })

  // Verify ownership
  const { data: existing } = await supabase
    .from('recipes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update recipe row
  const dbRecipe = toDbRecipeInsert(body, user.id)
  const { error: updateErr } = await supabase
    .from('recipes')
    .update({ ...dbRecipe, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 })

  // Replace child rows
  const [delIngErr, delStepErr] = await Promise.all([
    supabase.from('ingredient_lines').delete().eq('recipe_id', id),
    supabase.from('preparation_steps').delete().eq('recipe_id', id),
  ])

  if (delIngErr.error)
    return NextResponse.json({ error: delIngErr.error.message }, { status: 500 })
  if (delStepErr.error)
    return NextResponse.json({ error: delStepErr.error.message }, { status: 500 })

  const [ingResult, stepResult] = await Promise.all([
    body.ingredients?.length
      ? supabase
          .from('ingredient_lines')
          .insert(body.ingredients.map((ing, i) => toDbIngredientInsert(ing, id, i + 1)))
      : Promise.resolve({ error: null }),
    body.steps?.length
      ? supabase
          .from('preparation_steps')
          .insert(body.steps.map((step) => toDbPreparationStepInsert(step, id)))
      : Promise.resolve({ error: null }),
  ])

  if (ingResult.error)
    return NextResponse.json({ error: ingResult.error.message }, { status: 500 })
  if (stepResult.error)
    return NextResponse.json({ error: stepResult.error.message }, { status: 500 })

  // Return updated record
  const { data: full, error: fetchErr } = await supabase
    .from('recipes')
    .select('*, ingredient_lines(*), preparation_steps(*)')
    .eq('id', id)
    .single()

  if (fetchErr || !full)
    return NextResponse.json({ error: fetchErr?.message ?? 'Fetch failed' }, { status: 500 })

  return NextResponse.json({ recipe: toDomainRecipe(full) })
}

/**
 * DELETE /api/recipes/[id]
 * Soft-deletes by setting deleted_at.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('recipes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}

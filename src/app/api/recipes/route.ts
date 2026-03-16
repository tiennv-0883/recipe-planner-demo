import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import {
  toDomainRecipe,
  toDbRecipeInsert,
  toDbIngredientInsert,
  toDbPreparationStepInsert,
} from '@/src/lib/supabase/mappers'
import type { Recipe } from '@/src/types'

/**
 * GET /api/recipes
 * Lists all non-deleted recipes belonging to the authenticated user.
 * Supports ?q= (title substring) and ?tags= (comma-separated).
 */
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase()
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)

  let query = supabase
    .from('recipes')
    .select('*, ingredient_lines(*), preparation_steps(*)')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)
  if (tags && tags.length > 0) query = query.overlaps('tags', tags)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ recipes: (data ?? []).map(toDomainRecipe) })
}

/**
 * POST /api/recipes
 * Creates a new recipe with its ingredients and steps.
 * Body: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
 */
export async function POST(req: NextRequest) {
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

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  // Insert recipe row
  const { data: recipeRow, error: recipeErr } = await supabase
    .from('recipes')
    .insert(toDbRecipeInsert(body, user.id))
    .select()
    .single()

  if (recipeErr || !recipeRow)
    return NextResponse.json({ error: recipeErr?.message ?? 'Insert failed' }, { status: 500 })

  // Insert child rows in parallel
  const [ingResult, stepResult] = await Promise.all([
    body.ingredients?.length
      ? supabase
          .from('ingredient_lines')
          .insert(
            body.ingredients.map((ing, i) => toDbIngredientInsert(ing, recipeRow.id, i + 1)),
          )
      : Promise.resolve({ error: null }),
    body.steps?.length
      ? supabase
          .from('preparation_steps')
          .insert(
            body.steps.map((step) => toDbPreparationStepInsert(step, recipeRow.id)),
          )
      : Promise.resolve({ error: null }),
  ])

  if (ingResult.error)
    return NextResponse.json({ error: ingResult.error.message }, { status: 500 })
  if (stepResult.error)
    return NextResponse.json({ error: stepResult.error.message }, { status: 500 })

  // Fetch the full record with children to return
  const { data: full, error: fetchErr } = await supabase
    .from('recipes')
    .select('*, ingredient_lines(*), preparation_steps(*)')
    .eq('id', recipeRow.id)
    .single()

  if (fetchErr || !full)
    return NextResponse.json({ error: fetchErr?.message ?? 'Fetch failed' }, { status: 500 })

  return NextResponse.json({ recipe: toDomainRecipe(full) }, { status: 201 })
}

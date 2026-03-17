/**
 * Supabase seed helper.
 * Takes a userId and the SEED_RECIPES array, then inserts all recipes
 * with their ingredient_lines and preparation_steps using the admin client.
 */
import { createSupabaseAdminClient } from '@/src/lib/supabase/server'
import { SEED_RECIPES } from '@/src/data/recipes'
import {
  toDbRecipeInsert,
  toDbIngredientInsert,
  toDbPreparationStepInsert,
} from '@/src/lib/supabase/mappers'

export async function seedUserRecipes(userId: string) {
  const admin = await createSupabaseAdminClient()

  // Insert all recipe rows, replacing user_id
  const recipeRows = SEED_RECIPES.map((r) => ({
    ...toDbRecipeInsert(
      {
        title: r.title,
        photoUrl: r.photoUrl,
        cookTimeMinutes: r.cookTimeMinutes,
        servings: r.servings,
        tags: r.tags,
        ingredients: r.ingredients,
        steps: r.steps,
      },
      userId,
    ),
  }))

  const { data: insertedRecipes, error: recipeErr } = await admin
    .from('recipes')
    .insert(recipeRows)
    .select('id')

  if (recipeErr) throw new Error(`Seed recipes insert failed: ${recipeErr.message}`)
  if (!insertedRecipes || insertedRecipes.length === 0)
    throw new Error('Seed returned no recipe ids')

  // Build child rows using the DB-assigned ids (in insertion order)
  const ingredientRows = insertedRecipes.flatMap((row, i) => {
    const src = SEED_RECIPES[i]
    return (src?.ingredients ?? []).map((ing, j) =>
      toDbIngredientInsert(ing, row.id, j + 1),
    )
  })

  const stepRows = insertedRecipes.flatMap((row, i) => {
    const src = SEED_RECIPES[i]
    return (src?.steps ?? []).map((step) =>
      toDbPreparationStepInsert(step, row.id),
    )
  })

  const [ingResult, stepResult] = await Promise.all([
    ingredientRows.length
      ? admin.from('ingredient_lines').insert(ingredientRows)
      : Promise.resolve({ error: null }),
    stepRows.length
      ? admin.from('preparation_steps').insert(stepRows)
      : Promise.resolve({ error: null }),
  ])

  if (ingResult.error)
    throw new Error(`Seed ingredient_lines insert failed: ${ingResult.error.message}`)
  if (stepResult.error)
    throw new Error(`Seed preparation_steps insert failed: ${stepResult.error.message}`)

  // Mark user profile as seeded
  const { error: profileErr } = await admin
    .from('user_profiles')
    .update({ seeded_at: new Date().toISOString() })
    .eq('id', userId)

  if (profileErr)
    throw new Error(`Failed to mark user as seeded: ${profileErr.message}`)
}

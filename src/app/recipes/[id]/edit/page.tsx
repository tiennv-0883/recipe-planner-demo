'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeForm, { type RecipeFormValues } from '@/src/components/recipes/RecipeForm'
import { useRecipes } from '@/src/context/RecipeContext'
import { useAuth } from '@/src/context/AuthContext'
import { getRecipe, updateRecipe } from '@/src/services/recipes'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { state, apiDispatch } = useRecipes()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const recipe = getRecipe(state.recipes, params.id as string)

  if (!recipe) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <h1 className="text-xl font-semibold text-gray-700">Recipe not found</h1>
        </div>
      </MainLayout>
    )
  }

  async function handleSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    try {
      const { imageFile, ...recipeValues } = values

      // Start with the existing photoUrl; upload will override if a new file was selected
      let photoUrl = recipeValues.photoUrl

      // Upload new image to Storage (overwrites the previous file via upsert)
      if (imageFile && user) {
        const supabase = createSupabaseBrowserClient()
        const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${user.id}/${recipe!.id}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('recipe-images')
          .upload(path, imageFile, { upsert: true })
        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('recipe-images').getPublicUrl(path)
          photoUrl = publicUrl
        }
      }

      // Preserve original ingredient IDs where possible, generate new ones otherwise
      const updatedIngredients = recipeValues.ingredients.map((ing, i) => ({
        ...ing,
        id: recipe!.ingredients[i]?.id ?? `ing-${Date.now()}-${i}`,
      }))

      const updated = updateRecipe(recipe!, {
        ...recipeValues,
        photoUrl,
        ingredients: updatedIngredients,
        steps: recipeValues.steps.map((step, i) => ({ ...step, order: i + 1 })),
      })

      // apiDispatch calls PUT /api/recipes/[id] which persists photoUrl to Supabase,
      // then updates local state with the DB response.
      await apiDispatch({ type: 'UPDATE', payload: updated })
      router.push(`/recipes/${recipe!.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Recipe</h1>
        <RecipeForm
          initialValues={{
            title: recipe.title,
            cookTimeMinutes: recipe.cookTimeMinutes,
            servings: recipe.servings,
            tags: recipe.tags,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            photoUrl: recipe.photoUrl,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/recipes/${recipe.id}`)}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </MainLayout>
  )
}


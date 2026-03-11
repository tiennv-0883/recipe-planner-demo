'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeForm, { type RecipeFormValues } from '@/src/components/recipes/RecipeForm'
import { useRecipes } from '@/src/context/RecipeContext'
import { getRecipe, updateRecipe } from '@/src/services/recipes'

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const { state, dispatch } = useRecipes()
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

  function handleSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    try {
      // Preserve original ingredient IDs where possible, generate new ones otherwise
      const updatedIngredients = values.ingredients.map((ing, i) => ({
        ...ing,
        id: recipe!.ingredients[i]?.id ?? `ing-${Date.now()}-${i}`,
      }))
      const updated = updateRecipe(recipe!, {
        ...values,
        ingredients: updatedIngredients,
        steps: values.steps.map((step, i) => ({ ...step, order: i + 1 })),
      })
      dispatch({ type: 'UPDATE', payload: updated })
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

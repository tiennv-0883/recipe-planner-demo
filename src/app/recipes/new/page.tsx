'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeForm, { type RecipeFormValues } from '@/src/components/recipes/RecipeForm'
import { useRecipeDispatch } from '@/src/context/RecipeContext'
import { createRecipe } from '@/src/services/recipes'

export default function NewRecipePage() {
  const router = useRouter()
  const dispatch = useRecipeDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    try {
      const recipe = createRecipe({
        ...values,
        // Generate stable IDs for each ingredient
        ingredients: values.ingredients.map((ing, i) => ({
          ...ing,
          id: `ing-${Date.now()}-${i}`,
        })),
        // Convert steps to PreparationStep[]
        steps: values.steps.map((step, i) => ({ ...step, order: i + 1 })),
      })
      dispatch({ type: 'ADD', payload: recipe })
      router.push(`/recipes/${recipe.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Recipe</h1>
        <RecipeForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/recipes')}
          isSubmitting={isSubmitting}
          submitLabel="Create Recipe"
        />
      </div>
    </MainLayout>
  )
}

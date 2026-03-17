'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeForm, { type RecipeFormValues } from '@/src/components/recipes/RecipeForm'
import { useRecipes } from '@/src/context/RecipeContext'
import { useAuth } from '@/src/context/AuthContext'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function NewRecipePage() {
  const router = useRouter()
  const { dispatch } = useRecipes()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(values: RecipeFormValues) {
    setIsSubmitting(true)
    try {
      const { imageFile, ...recipeValues } = values

      // Step 1: Persist the recipe to Supabase first (API assigns the DB UUID).
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipeValues,
          ingredients: recipeValues.ingredients.map((ing, i) => ({
            ...ing,
            id: `ing-${Date.now()}-${i}`,
          })),
          steps: recipeValues.steps.map((step, i) => ({ ...step, order: i + 1 })),
        }),
      })
      if (!res.ok) return
      const data = await res.json()
      let savedRecipe = data.recipe as typeof data.recipe

      // Step 2: Upload image to Storage using the DB-assigned recipe UUID.
      if (imageFile && user) {
        const supabase = createSupabaseBrowserClient()
        const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${user.id}/${savedRecipe.id}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('recipe-images')
          .upload(path, imageFile, { upsert: true })
        if (!uploadErr) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('recipe-images').getPublicUrl(path)

          // Step 3: Update the recipe row with the photo URL.
          const updateRes = await fetch(`/api/recipes/${savedRecipe.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...savedRecipe, photoUrl: publicUrl }),
          })
          if (updateRes.ok) {
            const updateData = await updateRes.json()
            savedRecipe = updateData.recipe
          }
        }
      }

      // Update local state with the final recipe (including photoUrl from DB).
      dispatch({ type: 'ADD', payload: savedRecipe })
      router.push(`/recipes/${savedRecipe.id}`)
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


'use client'

import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeDetail from '@/src/components/recipes/RecipeDetail'
import { useRecipes } from '@/src/context/RecipeContext'
import { deleteRecipe } from '@/src/services/recipes'
import { getRecipe } from '@/src/services/recipes'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state, dispatch } = useRecipes()

  const recipe = getRecipe(state.recipes, params.id as string)

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this recipe?')) return
    const deleted = deleteRecipe(recipe!)
    dispatch({ type: 'UPDATE', payload: deleted })
    router.push('/recipes')
  }

  if (!recipe) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <h1 className="text-xl font-semibold text-gray-700">Recipe not found</h1>
          <p className="text-gray-500 mt-2">This recipe may have been deleted or doesn&apos;t exist.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <RecipeDetail recipe={recipe} onDelete={handleDelete} />
    </MainLayout>
  )
}

'use client'

import Link from 'next/link'
import MainLayout from '@/src/components/layout/MainLayout'
import RecipeList from '@/src/components/recipes/RecipeList'
import RecipeSearch from '@/src/components/recipes/RecipeSearch'
import { useRecipes } from '@/src/context/RecipeContext'
import { useTranslations } from 'next-intl'

export default function RecipesPage() {
  const { filteredRecipes, state, dispatch } = useRecipes()
  const t = useTranslations('recipes')
  const hasFilters = !!(state.searchQuery || state.selectedTags.length > 0)

  function handleClearFilters() {
    dispatch({ type: 'CLEAR_FILTERS' })
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredRecipes.length}{' '}
              {hasFilters ? t('found') : t('inYourCollection')}
            </p>
          </div>
          <Link
            href="/recipes/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t('newRecipe')}
          </Link>
        </div>

        {/* Search + filter + view toggle */}
        <div className="mb-6">
          <RecipeSearch />
        </div>

        {/* Recipe list/grid */}
        <RecipeList
          recipes={filteredRecipes}
          viewMode={state.viewMode}
          emptyMessage={
            hasFilters
              ? t('empty.withFilters')
              : t('empty.noFilters')
          }
          onClearFilters={hasFilters ? handleClearFilters : undefined}
        />
      </div>
    </MainLayout>
  )
}


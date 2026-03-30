'use client'

import Link from 'next/link'
import { clsx } from 'clsx'
import { useTranslations } from 'next-intl'
import RecipeCard from './RecipeCard'
import type { Recipe, Tag } from '@/src/types'

interface RecipeListProps {
  recipes: Recipe[]
  viewMode?: 'grid' | 'list'
  emptyMessage?: string
  /** Show "Clear filters" CTA in empty state */
  onClearFilters?: () => void
}

const TAG_COLORS: Record<Tag, string> = {
  breakfast: 'bg-yellow-100 text-yellow-700',
  lunch: 'bg-green-100 text-green-700',
  dinner: 'bg-blue-100 text-blue-700',
  healthy: 'bg-teal-100 text-teal-700',
  vegan: 'bg-lime-100 text-lime-700',
  vegetarian: 'bg-emerald-100 text-emerald-700',
}

function EmptyState({ message, onClearFilters }: { message: string; onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg
        className="w-16 h-16 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <p className="text-lg font-medium mb-2">{message}</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-2 text-sm text-brand-500 hover:text-brand-600 underline font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default function RecipeList({
  recipes,
  viewMode = 'grid',
  emptyMessage = 'No recipes found.',
  onClearFilters,
}: RecipeListProps) {
  if (recipes.length === 0) {
    return <EmptyState message={emptyMessage} onClearFilters={onClearFilters} />
  }

  if (viewMode === 'list') {
    return (
      <ul
        className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden"
        aria-label="Recipe list"
      >
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link
              href={`/recipes/${recipe.id}`}
              className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group focus:outline-none focus:bg-gray-50"
            >
              {/* Cook time badge */}
              <span className="shrink-0 flex items-center gap-1 text-xs text-gray-500 w-16">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                {recipe.cookTimeMinutes} min
              </span>

              {/* Title */}
              <span className="flex-1 text-sm font-medium text-gray-900 group-hover:text-brand-600 truncate">
                {recipe.title}
              </span>

              {/* Tags */}
              <span className="shrink-0 flex items-center gap-1.5">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      TAG_COLORS[tag as Tag] ?? 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {tTag(tag as Parameters<typeof tTag>[0])}
                  </span>
                ))}
              </span>

              {/* Chevron */}
              <svg
                className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  // Grid view (default)
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Recipe grid"
    >
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}

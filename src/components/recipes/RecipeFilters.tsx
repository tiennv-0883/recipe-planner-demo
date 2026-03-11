'use client'

import { clsx } from 'clsx'
import type { Tag } from '@/src/types'
import { useRecipes } from '@/src/context/RecipeContext'

const ALL_TAGS: Tag[] = ['breakfast', 'lunch', 'dinner', 'healthy', 'vegan', 'vegetarian']

export default function RecipeFilters() {
  const { state, dispatch } = useRecipes()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Search input */}
      <div className="relative flex-1 max-w-sm">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search recipes…"
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Search recipes"
        />
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        {ALL_TAGS.map((tag) => {
          const active = state.selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => dispatch({ type: 'TOGGLE_TAG', payload: tag })}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
              aria-pressed={active}
            >
              {tag}
            </button>
          )
        })}

        {(state.searchQuery || state.selectedTags.length > 0) && (
          <button
            onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
            className="rounded-full px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

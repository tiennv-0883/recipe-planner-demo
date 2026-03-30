'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import type { Tag } from '@/src/types'
import { useRecipes } from '@/src/context/RecipeContext'
import { useTranslations } from 'next-intl'

const ALL_TAGS: Tag[] = ['breakfast', 'lunch', 'dinner', 'healthy', 'vegan', 'vegetarian']

export default function RecipeSearch() {
  const { state, dispatch } = useRecipes()
  const t = useTranslations('recipes')
  const tTag = useTranslations('recipes.tags')

  // Local value for the input so we can debounce the dispatch
  const [inputValue, setInputValue] = useState(state.searchQuery)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep local value in sync when context is cleared externally
  useEffect(() => {
    setInputValue(state.searchQuery)
  }, [state.searchQuery])

  function handleInputChange(value: string) {
    setInputValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch({ type: 'SET_SEARCH', payload: value })
    }, 300)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const hasFilters = !!(state.searchQuery || state.selectedTags.length > 0)

  return (
    <div className="space-y-3">
      {/* Row 1: search input + view toggle */}
      <div className="flex items-center gap-3">
        {/* Debounced search input */}
        <div className="relative flex-1 max-w-sm">
          <span
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400"
            aria-hidden="true"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder={t('search.placeholder')}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            aria-label={t('search.ariaLabel')}
          />
        </div>

        {/* View mode toggle */}
        <div
          className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden"
          role="group"
          aria-label="View mode"
        >
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
            className={clsx(
              'p-2 transition-colors',
              state.viewMode === 'grid'
                ? 'bg-brand-500 text-white'
                : 'text-gray-500 hover:bg-gray-50',
            )}
            aria-pressed={state.viewMode === 'grid'}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h4v4H4V6zm6 0h4v4h-4V6zm6 0h4v4h-4V6zM4 12h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
            className={clsx(
              'p-2 transition-colors',
              state.viewMode === 'list'
                ? 'bg-brand-500 text-white'
                : 'text-gray-500 hover:bg-gray-50',
            )}
            aria-pressed={state.viewMode === 'list'}
            title="List view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Row 2: tag filter pills + clear */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by dietary tag">
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
              {tTag(tag as Parameters<typeof tTag>[0])}
            </button>
          )
        })}

        {hasFilters && (
          <button
            onClick={() => {
              dispatch({ type: 'CLEAR_FILTERS' })
              setInputValue('')
            }}
            className="rounded-full px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 underline transition-colors"
            aria-label={t('filter.ariaLabel')}
          >
            {t('filter.clear')}
          </button>
        )}
      </div>
    </div>
  )
}

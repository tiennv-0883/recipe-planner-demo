'use client'

import { useMemo, useState } from 'react'
import type { Recipe, DayOfWeek, MealType } from '@/src/types'

interface RecipePickerProps {
  recipes: Recipe[]
  day: DayOfWeek
  mealType: MealType
  onSelect: (recipeId: string) => void
  onClose: () => void
}

export default function RecipePicker({ recipes, day, mealType, onSelect, onClose }: RecipePickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return recipes
    const q = query.toLowerCase()
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q)),
    )
  }, [recipes, query])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Pick recipe for ${mealType} on ${day}`}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Choose a recipe</h2>
            <p className="text-xs text-gray-500 mt-0.5 capitalize">
              {day} · {mealType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            autoFocus
            aria-label="Search recipes"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recipes found</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((recipe) => (
                <li key={recipe.id}>
                  <button
                    onClick={() => {
                      onSelect(recipe.id)
                      onClose()
                    }}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{recipe.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {recipe.cookTimeMinutes} min · {recipe.servings} servings
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 shrink-0 max-w-[120px]">
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

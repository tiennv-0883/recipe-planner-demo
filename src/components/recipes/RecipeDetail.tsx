'use client'

import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'
import type { Recipe } from '@/src/types'

interface RecipeDetailProps {
  recipe: Recipe
  onDelete?: (id: string) => void
}

const TAG_STYLES: Record<string, string> = {
  breakfast: 'bg-yellow-100 text-yellow-800',
  lunch: 'bg-green-100 text-green-800',
  dinner: 'bg-blue-100 text-blue-800',
  healthy: 'bg-emerald-100 text-emerald-800',
  vegan: 'bg-lime-100 text-lime-800',
  vegetarian: 'bg-teal-100 text-teal-800',
}

export default function RecipeDetail({ recipe, onDelete }: RecipeDetailProps) {
  return (
    <article className="max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/recipes"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to recipes
      </Link>

      {/* Photo */}
      {recipe.photoUrl && (
        <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6 bg-gray-100">
          <Image
            src={recipe.photoUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {recipe.cookTimeMinutes} min
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className={clsx(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                TAG_STYLES[tag] ?? 'bg-gray-100 text-gray-700',
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h2>
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {recipe.ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-gray-800 capitalize">{ingredient.name}</span>
              <span className="text-gray-500 font-medium">
                {ingredient.quantity} {ingredient.unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step) => (
            <li key={step.order} className="flex gap-4">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold">
                {step.order}
              </span>
              <p className="text-gray-700 pt-1 leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}

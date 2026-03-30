'use client'

import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'
import { useTranslations } from 'next-intl'
import type { Recipe } from '@/src/types'

interface RecipeCardProps {
  recipe: Recipe
  className?: string
}

const TAG_STYLES: Record<string, string> = {
  breakfast: 'bg-yellow-100 text-yellow-800',
  lunch: 'bg-green-100 text-green-800',
  dinner: 'bg-blue-100 text-blue-800',
  healthy: 'bg-emerald-100 text-emerald-800',
  vegan: 'bg-lime-100 text-lime-800',
  vegetarian: 'bg-teal-100 text-teal-800',
}

export default function RecipeCard({ recipe, className }: RecipeCardProps) {
  const tTag = useTranslations('recipes.tags')
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className={clsx(
        'group block rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow',
        className,
      )}
      aria-label={`View recipe: ${recipe.title}`}
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-gray-100">
        {recipe.photoUrl ? (
          <Image
            src={recipe.photoUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {recipe.title}
        </h3>

        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cookTimeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={clsx(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  TAG_STYLES[tag] ?? 'bg-gray-100 text-gray-700',
                )}
              >
                {tTag(tag as Parameters<typeof tTag>[0])}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

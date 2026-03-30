import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { Recipe } from '@/src/types'

interface RecentRecipesProps {
  recipes: Recipe[]
}

export default function RecentRecipes({ recipes }: RecentRecipesProps) {
  const t = useTranslations('dashboard')
  const recent = recipes.slice(0, 4)

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">{t('recentRecipes.title')}</h2>
        <Link
          href="/recipes"
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          {t('recentRecipes.viewAll')} →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">{t('recentRecipes.empty')}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {recent.map((recipe) => (
            <li key={recipe.id}>
              <Link
                href={`/recipes/${recipe.id}`}
                className="flex items-center gap-3 py-3 hover:bg-gray-50 rounded-lg px-1 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {recipe.photoUrl ? (
                    <Image
                      src={recipe.photoUrl}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{recipe.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {recipe.cookTimeMinutes} min · {recipe.servings} servings
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

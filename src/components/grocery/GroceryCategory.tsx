'use client'

import { clsx } from 'clsx'
import { useTranslations } from 'next-intl'
import type { GroceryItem, CatalogEntry } from '@/src/types'
import { lookupByName } from '@/src/services/catalog'

interface GroceryCategoryProps {
  category: string
  items: GroceryItem[]
  onToggle: (id: string) => void
  onRemove?: (id: string) => void
  catalogEntries?: CatalogEntry[]
}

export default function GroceryCategory({
  category,
  items,
  onToggle,
  onRemove,
  catalogEntries = [],
}: GroceryCategoryProps) {
  const t = useTranslations('categories')
  const unchecked = items.filter((i) => !i.checked).length

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {t(category as Parameters<typeof t>[0])}
        </h3>
        <span className="text-xs text-gray-400">
          {unchecked}/{items.length}
        </span>
      </div>

      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {items.map((item) => {
          const match = catalogEntries.length > 0 ? lookupByName(item.name, catalogEntries) : undefined
          const hint =
            match && (match.price != null || match.storeName)
              ? [
                  match.price != null ? `~${match.price.toLocaleString('vi-VN')}đ${match.unit ? `/${match.unit}` : ''}` : null,
                  match.storeName ?? null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : null

          return (
            <li
              key={item.id}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                item.checked && 'bg-gray-50',
              )}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggle(item.id)}
                id={`item-${item.id}`}
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                aria-label={`Mark ${item.name} as ${item.checked ? 'unchecked' : 'checked'}`}
              />
              <label
                htmlFor={`item-${item.id}`}
                className={clsx(
                  'flex-1 cursor-pointer min-h-[44px] flex items-center',
                  item.checked ? 'text-gray-400' : 'text-gray-800',
                )}
              >
                <span className={clsx('block text-sm', item.checked && 'line-through')}>
                  {item.name}
                </span>
                {hint && !item.checked && (
                  <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>
                )}
              </label>
              <span className="text-sm text-gray-500 font-medium shrink-0">
                {item.quantity} {item.unit}
              </span>
              {item.isManual && onRemove && (
                <button
                  onClick={() => onRemove(item.id)}
                  className="ml-1 p-2.5 -m-2.5 text-gray-300 hover:text-red-400 transition-colors"
                  aria-label={`Remove ${item.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

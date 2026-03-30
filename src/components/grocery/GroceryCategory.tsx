'use client'

import { clsx } from 'clsx'
import { useTranslations } from 'next-intl'
import type { GroceryItem } from '@/src/types'

interface GroceryCategoryProps {
  category: string
  items: GroceryItem[]
  onToggle: (id: string) => void
  onRemove?: (id: string) => void
}

export default function GroceryCategory({
  category,
  items,
  onToggle,
  onRemove,
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
        {items.map((item) => (
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
                'flex-1 text-sm cursor-pointer',
                item.checked ? 'line-through text-gray-400' : 'text-gray-800',
              )}
            >
              {item.name}
            </label>
            <span className="text-sm text-gray-500 font-medium shrink-0">
              {item.quantity} {item.unit}
            </span>
            {item.isManual && onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="ml-1 text-gray-300 hover:text-red-400 transition-colors"
                aria-label={`Remove ${item.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

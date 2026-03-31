'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { clsx } from 'clsx'
import type { CatalogEntry } from '@/src/types'

interface CatalogCardProps {
  entry: CatalogEntry
  onEdit: (entry: CatalogEntry) => void
  onDelete: (id: string) => void
}

const STORE_TYPE_COLORS: Record<string, string> = {
  fresh: 'bg-green-100 text-green-700',
  frozen: 'bg-blue-100 text-blue-700',
  dry: 'bg-amber-100 text-amber-700',
  canned: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-600',
}

export default function CatalogCard({ entry, onEdit, onDelete }: CatalogCardProps) {
  const t = useTranslations('ingredientCatalog')
  const tTypes = useTranslations('storeTypes')
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">{entry.name}</span>
          {entry.storeType && (
            <span className={clsx('text-xs rounded-full px-2 py-0.5 font-medium', STORE_TYPE_COLORS[entry.storeType] ?? 'bg-gray-100 text-gray-600')}>
              {tTypes(entry.storeType)}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {entry.price != null ? (
            <span className="text-xs text-gray-500">
              {entry.price.toLocaleString('vi-VN')}đ{entry.unit ? `/${entry.unit}` : ''}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">{t('priceNotSet')}</span>
          )}
          {entry.storeName && (
            <span className="text-xs text-gray-400">{entry.storeName}</span>
          )}
          {entry.sellerPhone && (
            <span className="text-xs text-gray-400">{entry.sellerPhone}</span>
          )}
        </div>

        {entry.notes && (
          <p className="mt-1 text-xs text-gray-400 truncate">{entry.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-1 ml-3 shrink-0">
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setConfirming(false); onDelete(entry.id) }}
              className="rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              Xóa
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onEdit(entry)}
              className="rounded-md p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors min-h-[44px] px-3"
              aria-label={`Edit ${entry.name}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[44px] px-3"
              aria-label={`Delete ${entry.name}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}

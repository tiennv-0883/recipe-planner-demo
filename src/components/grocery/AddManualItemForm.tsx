'use client'

import { useState } from 'react'
import type { FoodCategory } from '@/src/types'
import { FOOD_CATEGORY_LABELS } from '@/src/data/categories'

const CATEGORIES: FoodCategory[] = [
  'vegetables_fruits',
  'meat_fish',
  'dairy_eggs',
  'grains_bread',
  'spices_seasonings',
  'other',
]

interface AddManualItemFormProps {
  onAdd: (item: { name: string; quantity: number; unit: string; category: FoodCategory }) => void
}

export default function AddManualItemForm({ onAdd }: AddManualItemFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [category, setCategory] = useState<FoodCategory>('other')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !quantity || !unit.trim()) {
      setError('All fields are required.')
      return
    }
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError('Quantity must be a positive number.')
      return
    }
    onAdd({ name: name.trim(), quantity: Number(quantity), unit: unit.trim(), category })
    setName('')
    setQuantity('')
    setUnit('')
    setCategory('other')
    setError('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add item manually
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-brand-200 bg-brand-50 p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Add item manually</h3>
      <div className="grid grid-cols-[1fr_80px_80px] gap-2 mb-2">
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Item name"
          autoFocus
        />
        <input
          type="number"
          placeholder="Qty"
          min={0}
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Quantity"
        />
        <input
          type="text"
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Unit"
        />
      </div>
      <div className="mb-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as FoodCategory)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-label="Category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {FOOD_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

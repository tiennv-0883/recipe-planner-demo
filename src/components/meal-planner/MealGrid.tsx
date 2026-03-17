'use client'

import { clsx } from 'clsx'
import type { DayOfWeek, MealType, MealPlan } from '@/src/types'
import type { Recipe } from '@/src/types'
import { getSlot, MAX_RECIPES_PER_SLOT } from '@/src/services/mealPlanner'

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner']
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

interface MealGridProps {
  plan: MealPlan
  recipesById: Record<string, Recipe>
  onAddRecipe: (day: DayOfWeek, mealType: MealType) => void
  onRemoveRecipe: (slotId: string, recipeId: string) => void
}

export default function MealGrid({ plan, recipesById, onAddRecipe, onRemoveRecipe }: MealGridProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr>
            <th className="w-24 p-2"></th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MEAL_TYPES.map((mealType) => (
            <tr key={mealType}>
              <td className="py-2 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wide align-top">
                {MEAL_LABELS[mealType]}
              </td>
              {DAYS.map((day) => {
                const slot = getSlot(plan, day, mealType)
                const assignedIds = slot?.recipeIds ?? []
                const isFull = assignedIds.length >= MAX_RECIPES_PER_SLOT
                const isEmpty = assignedIds.length === 0

                return (
                  <td key={day} className="p-1 align-top">
                    <div
                      className={clsx(
                        'relative min-h-[80px] rounded-lg border-2 border-dashed transition-colors',
                        isEmpty
                          ? 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50 cursor-pointer'
                          : 'border-gray-200 bg-white',
                      )}
                      onClick={() => isEmpty && onAddRecipe(day, mealType)}
                      role={isEmpty ? 'button' : undefined}
                      tabIndex={isEmpty ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (isEmpty && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          onAddRecipe(day, mealType)
                        }
                      }}
                      aria-label={
                        isEmpty
                          ? `Add ${mealType} for ${day}`
                          : `${mealType} on ${day}: ${assignedIds.length} recipe${assignedIds.length > 1 ? 's' : ''}`
                      }
                    >
                      {isEmpty ? (
                        /* Empty cell */
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      ) : (
                        /* Slot with recipes */
                        <div className="p-2 flex flex-col gap-1">
                          {assignedIds.map((id) => {
                            const recipe = recipesById[id]
                            if (!recipe) return null
                            return (
                              <div key={id} className="flex items-start justify-between gap-1">
                                <p className="text-xs font-medium text-gray-800 line-clamp-2 flex-1">
                                  {recipe.title}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onRemoveRecipe(slot!.id, id)
                                  }}
                                  className="shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                                  aria-label={`Remove ${recipe.title}`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )
                          })}
                          {!isFull && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddRecipe(day, mealType)
                              }}
                              className="mt-1 text-xs text-brand-500 hover:text-brand-700 font-medium text-left"
                              aria-label={`Add another recipe to ${mealType} on ${day}`}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

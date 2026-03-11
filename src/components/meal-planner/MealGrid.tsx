'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import type { DayOfWeek, MealType, MealPlan } from '@/src/types'
import type { Recipe } from '@/src/types'
import { getSlot } from '@/src/services/mealPlanner'

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
  onAssign: (day: DayOfWeek, mealType: MealType) => void
  onClear: (day: DayOfWeek, mealType: MealType) => void
}

export default function MealGrid({ plan, recipesById, onAssign, onClear }: MealGridProps) {
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
                const recipe = slot ? recipesById[slot.recipeId] : undefined

                return (
                  <td key={day} className="p-1 align-top">
                    <div
                      className={clsx(
                        'relative min-h-[80px] rounded-lg border-2 border-dashed transition-colors',
                        slot && recipe
                          ? 'border-gray-200 bg-white'
                          : slot && !recipe
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50 cursor-pointer',
                      )}
                      onClick={() => !slot && onAssign(day, mealType)}
                      role={!slot ? 'button' : undefined}
                      tabIndex={!slot ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (!slot && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault()
                          onAssign(day, mealType)
                        }
                      }}
                      aria-label={
                        slot && recipe
                          ? `${mealType} on ${day}: ${recipe.title}`
                          : slot && !recipe
                          ? `${mealType} on ${day}: Recipe removed`
                          : `Add ${mealType} for ${day}`
                      }
                    >
                      {slot && recipe ? (
                        <div className="p-2 h-full flex flex-col">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 flex-1">
                            {recipe.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">{recipe.cookTimeMinutes}m</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onClear(day, mealType)
                              }}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                              aria-label={`Remove ${recipe.title}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : slot && !recipe ? (
                        /* Orphan slot — recipe was deleted */
                        <div
                          className="p-2 h-full flex flex-col cursor-pointer"
                          onClick={() => onAssign(day, mealType)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onAssign(day, mealType)
                            }
                          }}
                          aria-label={`Recipe removed. Add ${mealType} for ${day}`}
                        >
                          <p className="text-xs font-medium text-amber-600 line-clamp-2 flex-1">
                            Recipe removed
                          </p>
                          <p className="text-xs text-amber-400 mt-1">Tap to replace</p>
                          <div className="flex justify-end mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onClear(day, mealType)
                              }}
                              className="text-gray-300 hover:text-red-400 transition-colors"
                              aria-label={`Clear orphan slot for ${mealType} on ${day}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
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

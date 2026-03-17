'use client'

import { useState } from 'react'
import MainLayout from '@/src/components/layout/MainLayout'
import WeekNavigator from '@/src/components/meal-planner/WeekNavigator'
import MealGrid from '@/src/components/meal-planner/MealGrid'
import RecipePicker from '@/src/components/meal-planner/RecipePicker'
import { useMealPlan } from '@/src/context/MealPlanContext'
import { useRecipes } from '@/src/context/RecipeContext'
import { relativeIsoWeek, currentIsoWeek } from '@/src/lib/weekUtils'
import type { DayOfWeek, MealType } from '@/src/types'

interface PickerTarget {
  day: DayOfWeek
  mealType: MealType
}

export default function MealPlannerPage() {
  const { state, apiDispatch, activePlan } = useMealPlan()
  const { allRecipes } = useRecipes()
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null)

  const recipesById = Object.fromEntries(allRecipes.map((r) => [r.id, r]))

  function navigatePrev() {
    const prev = relativeIsoWeek(state.activeWeek, -1)
    apiDispatch({ type: 'SET_ACTIVE_WEEK', payload: prev })
  }

  function navigateNext() {
    const next = relativeIsoWeek(state.activeWeek, 1)
    apiDispatch({ type: 'SET_ACTIVE_WEEK', payload: next })
  }

  function navigateToday() {
    apiDispatch({ type: 'SET_ACTIVE_WEEK', payload: currentIsoWeek() })
  }

  function handleAddRecipe(day: DayOfWeek, mealType: MealType) {
    setPickerTarget({ day, mealType })
  }

  function handleSelectRecipe(recipeId: string) {
    if (!pickerTarget) return
    apiDispatch({
      type: 'ADD_RECIPE',
      payload: {
        isoWeek: state.activeWeek,
        day: pickerTarget.day,
        mealType: pickerTarget.mealType,
        recipeId,
      },
    })
    setPickerTarget(null)
  }

  function handleRemoveRecipe(slotId: string, recipeId: string) {
    apiDispatch({
      type: 'REMOVE_RECIPE',
      payload: { isoWeek: state.activeWeek, slotId, recipeId },
    })
  }

  const filledCount = activePlan.slots.filter((s) => s.recipeIds.length > 0).length
  const totalSlots = 7 * 3 // days × meal types

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filledCount} of {totalSlots} slots filled
          </p>
        </div>

        {/* Week navigator */}
        <div className="mb-4">
          <WeekNavigator
            isoWeek={state.activeWeek}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onToday={navigateToday}
          />
        </div>

        {/* Meal grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <MealGrid
            plan={activePlan}
            recipesById={recipesById}
            onAddRecipe={handleAddRecipe}
            onRemoveRecipe={handleRemoveRecipe}
          />
        </div>

        {/* Empty week callout */}
        {filledCount === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-brand-200 bg-brand-50 px-6 py-8 text-center">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-brand-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-base font-semibold text-brand-700 mb-1">No meals planned yet</p>
            <p className="text-sm text-brand-500">
              Click any cell in the grid above to assign a recipe to a meal slot.
            </p>
          </div>
        )}

        {/* Clear week */}
        {filledCount > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (confirm('Clear all meals for this week?')) {
                  apiDispatch({ type: 'CLEAR_WEEK', payload: state.activeWeek })
                }
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear week
            </button>
          </div>
        )}
      </div>

      {/* Recipe picker modal */}
      {pickerTarget && (
        <RecipePicker
          recipes={allRecipes}
          day={pickerTarget.day}
          mealType={pickerTarget.mealType}
          onSelect={handleSelectRecipe}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </MainLayout>
  )
}

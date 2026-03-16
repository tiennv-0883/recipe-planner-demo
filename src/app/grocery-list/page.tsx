'use client'

import MainLayout from '@/src/components/layout/MainLayout'
import GroceryCategory from '@/src/components/grocery/GroceryCategory'
import AddManualItemForm from '@/src/components/grocery/AddManualItemForm'
import WeekNavigator from '@/src/components/meal-planner/WeekNavigator'
import { useGrocery } from '@/src/context/GroceryContext'
import { useMealPlan } from '@/src/context/MealPlanContext'
import { useRecipes } from '@/src/context/RecipeContext'
import { relativeIsoWeek, currentIsoWeek } from '@/src/lib/weekUtils'
import {
  generateGroceryList,
  groupByCategory,
  uncheckedCount,
  addManualItem,
} from '@/src/services/groceryList'
import type { FoodCategory } from '@/src/types'

export default function GroceryListPage() {
  const { state: groceryState, dispatch: groceryDispatch, activeList } = useGrocery()
  const { state: mealState } = useMealPlan()
  const { allRecipes } = useRecipes()

  const recipesById = Object.fromEntries(allRecipes.map((r) => [r.id, r]))
  const activePlan = mealState.plans[groceryState.activeWeek] ?? {
    isoWeek: groceryState.activeWeek,
    slots: [],
    updatedAt: '',
  }

  function handleGenerate() {
    const list = generateGroceryList(activePlan, recipesById)
    groceryDispatch({ type: 'SET_LIST', payload: list })
  }

  function handleToggle(itemId: string) {
    groceryDispatch({
      type: 'TOGGLE_ITEM',
      payload: { isoWeek: groceryState.activeWeek, itemId },
    })
  }

  function handleRemove(itemId: string) {
    groceryDispatch({
      type: 'REMOVE_ITEM',
      payload: { isoWeek: groceryState.activeWeek, itemId },
    })
  }

  function handleAddManual(item: {
    name: string
    quantity: number
    unit: string
    category: FoodCategory
  }) {
    const updatedList = addManualItem(activeList, item)
    groceryDispatch({ type: 'SET_LIST', payload: updatedList })
  }

  function navigatePrev() {
    const prev = relativeIsoWeek(groceryState.activeWeek, -1)
    groceryDispatch({ type: 'SET_ACTIVE_WEEK', payload: prev })
  }

  function navigateNext() {
    const next = relativeIsoWeek(groceryState.activeWeek, 1)
    groceryDispatch({ type: 'SET_ACTIVE_WEEK', payload: next })
  }

  function navigateToday() {
    groceryDispatch({ type: 'SET_ACTIVE_WEEK', payload: currentIsoWeek() })
  }

  const groups = groupByCategory(activeList.items)
  const remaining = uncheckedCount(activeList)
  const total = activeList.items.length
  const hasMeals = activePlan.slots.length > 0

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Grocery List</h1>
          {total > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {remaining} item{remaining !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>

        {/* Week navigator */}
        <div className="mb-4">
          <WeekNavigator
            isoWeek={groceryState.activeWeek}
            onPrev={navigatePrev}
            onNext={navigateNext}
            onToday={navigateToday}
          />
        </div>

        {/* Generate button */}
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={!hasMeals}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {activeList.generatedAt ? 'Re-generate list' : 'Generate from meal plan'}
          </button>
          {!hasMeals && (
            <p className="mt-2 text-xs text-gray-400">
              Plan some meals for this week first.
            </p>
          )}
        </div>

        {/* Grocery items */}
        {total === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            {!hasMeals ? (
              <>
                <p className="text-sm font-medium text-gray-500 mb-1">No meals planned for this week</p>
                <p className="text-xs text-gray-400 mb-4">
                  Add meals to your planner, then generate your grocery list.
                </p>
                <a
                  href="/meal-planner"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  Go to Meal Planner
                </a>
              </>
            ) : (
              <p className="text-sm">No items yet. Click &quot;Generate from meal plan&quot; above.</p>
            )}
          </div>
        ) : (
          groups.map(({ category, items }) => (
            <GroceryCategory
              key={category}
              category={category}
              items={items}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
          ))
        )}

        {/* Add manual item */}
        <div className="mt-4">
          <AddManualItemForm onAdd={handleAddManual} />
        </div>
      </div>
    </MainLayout>
  )
}

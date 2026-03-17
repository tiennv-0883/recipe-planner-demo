'use client'

import MainLayout from '@/src/components/layout/MainLayout'
import WeekAtAGlance from '@/src/components/dashboard/WeekAtAGlance'
import RecentRecipes from '@/src/components/dashboard/RecentRecipes'
import { useRecipes } from '@/src/context/RecipeContext'
import { useMealPlan } from '@/src/context/MealPlanContext'
import { useGrocery } from '@/src/context/GroceryContext'
import { uncheckedCount } from '@/src/services/groceryList'
import Link from 'next/link'

export default function DashboardPage() {
  const { allRecipes } = useRecipes()
  const { state: mealState, activePlan } = useMealPlan()
  const { activeList } = useGrocery()

  const recipesById = Object.fromEntries(allRecipes.map((r) => [r.id, r]))
  const groceryRemaining = uncheckedCount(activeList)
  const filledMeals = activePlan.slots.length

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here&apos;s your week at a glance.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Recipes"
            value={allRecipes.length}
            href="/recipes"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <StatCard
            label="Meals Planned"
            value={filledMeals}
            href="/meal-planner"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Grocery Items Left"
            value={groceryRemaining}
            href="/grocery-list"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeekAtAGlance
            isoWeek={mealState.activeWeek}
            plan={activePlan}
            recipesById={recipesById}
          />
          <RecentRecipes recipes={allRecipes} />
        </div>
      </div>
    </MainLayout>
  )
}

function StatCard({
  label,
  value,
  href,
  icon,
}: {
  label: string
  value: number
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </Link>
  )
}

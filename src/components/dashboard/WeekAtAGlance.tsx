'use client'

import Link from 'next/link'
import type { Recipe, MealPlan } from '@/src/types'
import { useTranslations } from 'next-intl'

const DAYS_ORDERED = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

interface WeekAtAGlanceProps {
  isoWeek: string
  plan: MealPlan
  recipesById: Record<string, Recipe>
}

export default function WeekAtAGlance({ isoWeek, plan, recipesById }: WeekAtAGlanceProps) {
  const t = useTranslations('dashboard')
  const filledCount = plan.slots.filter((s) => s.recipeIds.length > 0).length
  const totalSlots = 7 * 3

  const today = new Date()
  const todayDay = DAYS_ORDERED[((today.getDay() + 6) % 7)]

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{t('weekAtAGlance.title')}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{isoWeek}</p>
        </div>
        <Link
          href="/meal-planner"
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          {t('weekAtAGlance.manage')} →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{t('weekAtAGlance.mealsPlanned', { count: filledCount })}</span>
          <span>{t('weekAtAGlance.slotsEmpty', { count: totalSlots - filledCount })}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-300"
            style={{ width: `${(filledCount / totalSlots) * 100}%` }}
            aria-valuenow={filledCount}
            aria-valuemin={0}
            aria-valuemax={totalSlots}
            role="progressbar"
            aria-label="Weekly meal plan progress"
          />
        </div>
      </div>

      {/* Day rows */}
      <div className="space-y-2">
        {DAYS_ORDERED.map((day) => {
          const daySlots = plan.slots.filter((s) => s.day === day)
          const isToday = day === todayDay
          return (
            <div
              key={day}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isToday ? 'bg-brand-50 border border-brand-100' : ''}`}
            >
              <span className={`w-8 text-xs font-semibold uppercase ${isToday ? 'text-brand-600' : 'text-gray-400'}`}>
                {day.slice(0, 3)}
              </span>
              <div className="flex gap-1.5 flex-wrap flex-1">
                {daySlots.flatMap((s) => s.recipeIds).length === 0 ? (
                  <span className="text-xs text-gray-300">{t('weekAtAGlance.noMeals')}</span>
                ) : (
                  daySlots.flatMap((slot) =>
                    slot.recipeIds.map((id) => {
                      const recipe = recipesById[id]
                      return (
                        <span
                          key={`${slot.id}-${id}`}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                        >
                          {recipe?.title ?? '?'}
                        </span>
                      )
                    })
                  )
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty week CTA */}
      {filledCount === 0 && (
        <div className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-center">
          <p className="text-xs text-brand-600 mb-2">{t('weekAtAGlance.emptyWeek')}</p>
          <Link
            href="/meal-planner"
            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            {t('weekAtAGlance.planMeals')} →
          </Link>
        </div>
      )}
    </div>
  )
}

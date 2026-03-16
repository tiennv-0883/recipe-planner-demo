'use client'

import { isoWeekToDateRange } from '@/src/lib/weekUtils'

interface WeekNavigatorProps {
  isoWeek: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function WeekNavigator({ isoWeek, onPrev, onNext, onToday }: WeekNavigatorProps) {
  const { start, end } = isoWeekToDateRange(isoWeek)
  const today = new Date()
  const todayTime = today.getTime()
  const isCurrentWeek = todayTime >= start.getTime() && todayTime <= end.getTime() + 86400000

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Previous week"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="text-center min-w-[180px]">
          <div className="text-sm font-semibold text-gray-900">
            {formatDate(start)} – {formatDate(end)}
          </div>
          <div className="text-xs text-gray-500">{isoWeek}</div>
        </div>

        <button
          onClick={onNext}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Next week"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {!isCurrentWeek && (
        <button
          onClick={onToday}
          className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          This week
        </button>
      )}
    </div>
  )
}

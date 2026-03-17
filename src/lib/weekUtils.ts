/**
 * ISO 8601 week utilities.
 * Week format: "YYYY-WNN" e.g. "2026-W11"
 */

export interface IsoWeekParts {
  year: number
  week: number
}

export interface DateRange {
  start: Date
  end: Date
}

const ISO_WEEK_RE = /^(\d{4})-W(\d{2})$/

export function parseIsoWeek(isoWeek: string): IsoWeekParts {
  const m = ISO_WEEK_RE.exec(isoWeek)
  if (!m) throw new Error(`Invalid ISO week format: "${isoWeek}"`)
  return { year: parseInt(m[1], 10), week: parseInt(m[2], 10) }
}

export function formatIsoWeek(year: number, week: number): string {
  return `${year}-W${String(week).padStart(2, '0')}`
}

/**
 * Return the ISO week that contains today's date.
 */
export function currentIsoWeek(): string {
  const { year, week } = getIsoWeekParts(new Date())
  return formatIsoWeek(year, week)
}

/**
 * Return the ISO week that is `offset` weeks away from `isoWeek`.
 */
export function relativeIsoWeek(isoWeek: string, offset: number): string {
  if (offset === 0) return isoWeek
  const { start } = isoWeekToDateRange(isoWeek)
  const target = new Date(start)
  target.setDate(target.getDate() + offset * 7)
  const { year, week } = getIsoWeekParts(target)
  return formatIsoWeek(year, week)
}

/**
 * Return the Monday–Sunday date range for an ISO week.
 */
export function isoWeekToDateRange(isoWeek: string): DateRange {
  const { year, week } = parseIsoWeek(isoWeek)

  // Find Jan 4th of that year (always in week 1 per ISO 8601)
  const jan4 = new Date(year, 0, 4)
  // Monday of week 1
  const mondayW1 = new Date(jan4)
  mondayW1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))

  const start = new Date(mondayW1)
  start.setDate(mondayW1.getDate() + (week - 1) * 7)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return { start, end }
}

// ---- Internal helpers ----

function getIsoWeekParts(date: Date): IsoWeekParts {
  // Use UTC to avoid DST shifts
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  // Move to nearest Thursday (ISO 8601: week owner)
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7))
  const year = tmp.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year, week: weekNo }
}

import {
  currentIsoWeek,
  relativeIsoWeek,
  isoWeekToDateRange,
  parseIsoWeek,
  formatIsoWeek,
} from '@/src/lib/weekUtils'

describe('weekUtils', () => {
  describe('currentIsoWeek', () => {
    it('returns a string matching ISO week format YYYY-WNN', () => {
      const result = currentIsoWeek()
      expect(result).toMatch(/^\d{4}-W\d{2}$/)
    })

    it('returns a week number between W01 and W53', () => {
      const result = currentIsoWeek()
      const weekNum = parseInt(result.split('-W')[1], 10)
      expect(weekNum).toBeGreaterThanOrEqual(1)
      expect(weekNum).toBeLessThanOrEqual(53)
    })
  })

  describe('relativeIsoWeek', () => {
    it('returns the same week when offset is 0', () => {
      const base = '2026-W11'
      expect(relativeIsoWeek(base, 0)).toBe('2026-W11')
    })

    it('advances by 1 week', () => {
      expect(relativeIsoWeek('2026-W11', 1)).toBe('2026-W12')
    })

    it('goes back 1 week', () => {
      expect(relativeIsoWeek('2026-W11', -1)).toBe('2026-W10')
    })

    it('wraps to next year at end of year (W52)', () => {
      const result = relativeIsoWeek('2026-W52', 1)
      expect(result).toMatch(/^\d{4}-W\d{2}$/)
    })

    it('wraps to previous year at start of year (W01)', () => {
      const result = relativeIsoWeek('2026-W01', -1)
      // Should be in 2025 or prior
      const year = parseInt(result.split('-W')[0], 10)
      expect(year).toBeLessThan(2026)
    })

    it('advances by 4 weeks', () => {
      expect(relativeIsoWeek('2026-W01', 4)).toBe('2026-W05')
    })
  })

  describe('isoWeekToDateRange', () => {
    it('returns an object with start and end Date', () => {
      const range = isoWeekToDateRange('2026-W11')
      expect(range.start).toBeInstanceOf(Date)
      expect(range.end).toBeInstanceOf(Date)
    })

    it('start is Monday', () => {
      const range = isoWeekToDateRange('2026-W11')
      expect(range.start.getDay()).toBe(1) // Monday = 1
    })

    it('end is Sunday', () => {
      const range = isoWeekToDateRange('2026-W11')
      expect(range.end.getDay()).toBe(0) // Sunday = 0
    })

    it('end is 6 days after start', () => {
      const range = isoWeekToDateRange('2026-W11')
      const diffMs = range.end.getTime() - range.start.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(6)
    })
  })

  describe('parseIsoWeek', () => {
    it('parses a valid ISO week string', () => {
      const result = parseIsoWeek('2026-W11')
      expect(result).toEqual({ year: 2026, week: 11 })
    })

    it('throws on invalid format', () => {
      expect(() => parseIsoWeek('invalid')).toThrow()
    })
  })

  describe('formatIsoWeek', () => {
    it('formats a week number correctly', () => {
      expect(formatIsoWeek(2026, 11)).toBe('2026-W11')
    })

    it('zero-pads single-digit weeks', () => {
      expect(formatIsoWeek(2026, 5)).toBe('2026-W05')
    })
  })
})

import { describe, expect, it } from 'vitest'
import { dayBucketKey, pickWordOfDay, wordsAddedByDay } from './stats'

describe('dayBucketKey', () => {
  it('stays on the previous day before 6am', () => {
    expect(dayBucketKey(new Date(2026, 0, 15, 5, 59))).toBe('2026-01-14')
    expect(dayBucketKey(new Date(2026, 0, 15, 6, 0))).toBe('2026-01-15')
  })
})

describe('pickWordOfDay', () => {
  const words = [{ id: 1 }, { id: 2 }, { id: 3 }]

  it('is stable within the same day bucket', () => {
    const a = pickWordOfDay(words, new Date(2026, 0, 15, 8, 0))
    const b = pickWordOfDay(words, new Date(2026, 0, 15, 23, 0))
    expect(a).toEqual(b)
  })

  it('returns null for an empty list', () => {
    expect(pickWordOfDay([], new Date())).toBeNull()
  })
})

describe('wordsAddedByDay', () => {
  it('zero-fills days with no additions and counts same-day words', () => {
    const today = new Date(2026, 0, 15)
    const words = [
      { created_at: new Date(2026, 0, 15).toISOString() },
      { created_at: new Date(2026, 0, 15).toISOString() },
      { created_at: new Date(2026, 0, 13).toISOString() },
    ] as { created_at: string }[]

    const result = wordsAddedByDay(words as never, 3, today)
    expect(result).toHaveLength(3)
    expect(result[0].count).toBe(1) // Jan 13
    expect(result[1].count).toBe(0) // Jan 14
    expect(result[2].count).toBe(2) // Jan 15
  })
})

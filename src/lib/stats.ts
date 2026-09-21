import type { Word } from '../api/types'
import { WORD_TYPES, type WordType } from './wordTypes'

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function countsByType(words: Word[]): Record<WordType, number> {
  const counts = Object.fromEntries(WORD_TYPES.map((t) => [t, 0])) as Record<WordType, number>
  for (const w of words) counts[w.type]++
  return counts
}

export interface DailyCount {
  date: string
  count: number
}

/** Zero-filled daily counts for the trailing `days` days, based on created_at. */
export function wordsAddedByDay(words: Word[], days: number, today: Date = new Date()): DailyCount[] {
  const byDay = new Map<string, number>()
  for (const w of words) {
    const key = localDateKey(new Date(w.created_at))
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }

  const result: DailyCount[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = localDateKey(d)
    result.push({ date: key, count: byDay.get(key) ?? 0 })
  }
  return result
}

export interface TypeCount {
  type: WordType
  count: number
}

/**
 * Types present in the collection, most words first — the order the History
 * filter row renders left to right.
 *
 * Types with no words are left out rather than shown as an unusable "0" chip.
 * Ties fall back to the fixed WORD_TYPES order so the row stays put between
 * renders instead of reshuffling whenever two types are level.
 */
export function typeCountsDescending(words: Word[]): TypeCount[] {
  const counts = countsByType(words)
  return WORD_TYPES.map((type) => ({ type, count: counts[type] }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count || WORD_TYPES.indexOf(a.type) - WORD_TYPES.indexOf(b.type))
}

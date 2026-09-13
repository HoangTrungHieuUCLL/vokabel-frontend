import type { Word } from '../api/types'
import { WORD_TYPES, type WordType } from './wordTypes'

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// djb2 -- good enough for picking a stable-but-shuffled daily index, not for security.
function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return h >>> 0
}

/** The "day" flips at 6am, not midnight, so late-night sessions still see yesterday's word. */
export function dayBucketKey(now: Date = new Date()): string {
  const adjusted = new Date(now)
  if (adjusted.getHours() < 6) adjusted.setDate(adjusted.getDate() - 1)
  return localDateKey(adjusted)
}

/**
 * Deterministic pick from the day bucket + word id -- same word all day for
 * everyone on this device, changes at the next 6am bucket, no state to persist.
 */
export function pickWordOfDay<T extends { id: number }>(words: T[], now: Date = new Date()): T | null {
  if (words.length === 0) return null
  const bucket = dayBucketKey(now)
  let best: T | null = null
  let bestHash = Infinity
  for (const w of words) {
    const h = hashString(`${bucket}:${w.id}`)
    if (h < bestHash) {
      bestHash = h
      best = w
    }
  }
  return best
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

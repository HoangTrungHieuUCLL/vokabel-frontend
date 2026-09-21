import type { Word } from '../api/types'
import { FACET_ORDER, facetArtikelOf, facetTypeOf, wordFacetKey, type Artikel } from './artikel'
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

export interface FacetCount {
  /** Either a word type, or "nomen:der" / "nomen:die" / "nomen:das". */
  key: string
  type: WordType
  artikel: Artikel | null
  count: number
}

/**
 * The facets present in the collection, most words first -- the order the
 * History filter row renders left to right. Nouns are split by gender, so
 * "der" and "die" are ranked against each other and against the other types
 * rather than lumped into one Nomen bucket.
 *
 * A facet with no words is left out rather than shown as an unusable "0"
 * chip. Ties fall back to the fixed facet order so the row stays put between
 * renders instead of reshuffling whenever two facets are level.
 */
export function facetCountsDescending(words: Word[]): FacetCount[] {
  const counts = new Map<string, number>()
  for (const word of words) {
    const key = wordFacetKey(word)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([key, count]) => ({
      key,
      type: facetTypeOf(key),
      artikel: facetArtikelOf(key),
      count,
    }))
    .sort((a, b) => b.count - a.count || FACET_ORDER.indexOf(a.key) - FACET_ORDER.indexOf(b.key))
}

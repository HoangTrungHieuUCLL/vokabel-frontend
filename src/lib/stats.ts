import type { Word } from '../api/types'
import { ARTIKEL, artikelOf, type Artikel } from './artikel'
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

export interface ArtikelCount {
  artikel: Artikel
  count: number
}

export interface NounFacet {
  kind: 'nouns'
  /** Every noun, including any that predate the required-article rule. */
  count: number
  /** Only the genders actually present, most words first. */
  genders: ArtikelCount[]
}

export interface TypeFacet {
  kind: 'type'
  type: WordType
  count: number
}

export type HistoryFacet = NounFacet | TypeFacet

/**
 * The facets the History filter row renders, left to right, most words first.
 *
 * Nouns are one grouped facet rather than three loose chips: the group shows
 * the noun total and its der/die/das split together, and it is ranked among
 * the other types by that total.
 *
 * A facet with no words is left out rather than shown as an unusable "0"
 * chip. Ties fall back to the fixed type order so the row stays put between
 * renders instead of reshuffling whenever two facets are level.
 */
export function historyFacets(words: Word[]): HistoryFacet[] {
  const byType = countsByType(words)
  const byArtikel = new Map<Artikel, number>()
  for (const word of words) {
    const artikel = artikelOf(word)
    if (artikel) byArtikel.set(artikel, (byArtikel.get(artikel) ?? 0) + 1)
  }

  const facets: HistoryFacet[] = WORD_TYPES.filter((type) => byType[type] > 0).map((type) =>
    type === 'nomen'
      ? {
          kind: 'nouns',
          count: byType.nomen,
          genders: ARTIKEL.map((artikel) => ({ artikel, count: byArtikel.get(artikel) ?? 0 }))
            .filter(({ count }) => count > 0)
            .sort((a, b) => b.count - a.count || ARTIKEL.indexOf(a.artikel) - ARTIKEL.indexOf(b.artikel)),
        }
      : { kind: 'type', type, count: byType[type] },
  )

  // Stable index so equal counts never reshuffle between renders.
  const orderOf = (f: HistoryFacet) => WORD_TYPES.indexOf(f.kind === 'nouns' ? 'nomen' : f.type)
  return facets.sort((a, b) => b.count - a.count || orderOf(a) - orderOf(b))
}

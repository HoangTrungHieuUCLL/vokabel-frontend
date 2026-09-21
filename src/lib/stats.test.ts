import { describe, expect, it } from 'vitest'
import { facetCountsDescending, wordsAddedByDay } from './stats'
import type { Word } from '../api/types'
import type { WordType } from './wordTypes'

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

describe('facetCountsDescending', () => {
  function noun(id: number, artikel?: string): Word {
    return { id, type: 'nomen', attrs: artikel ? { artikel } : {} } as Word
  }
  function other(id: number, type: WordType): Word {
    return { id, type, attrs: {} } as Word
  }

  it('orders facets from most to fewest words', () => {
    const words = [other(1, 'verb'), other(2, 'verb'), other(3, 'verb'), other(4, 'adjektiv')]
    expect(facetCountsDescending(words).map((f) => [f.key, f.count])).toEqual([
      ['verb', 3],
      ['adjektiv', 1],
    ])
  })

  it('splits nouns by gender instead of one Nomen bucket', () => {
    const words = [
      noun(1, 'der'),
      noun(2, 'die'),
      noun(3, 'die'),
      noun(4, 'das'),
      noun(5, 'das'),
      noun(6, 'das'),
    ]
    expect(facetCountsDescending(words)).toEqual([
      { key: 'nomen:das', type: 'nomen', artikel: 'das', count: 3 },
      { key: 'nomen:die', type: 'nomen', artikel: 'die', count: 2 },
      { key: 'nomen:der', type: 'nomen', artikel: 'der', count: 1 },
    ])
  })

  it('ranks each gender against the other types, not nouns as a whole', () => {
    // Four nouns in total would outrank the three verbs if they were one
    // bucket; split by gender, the verbs come first.
    const words = [
      noun(1, 'der'),
      noun(2, 'der'),
      noun(3, 'die'),
      noun(4, 'das'),
      other(5, 'verb'),
      other(6, 'verb'),
      other(7, 'verb'),
    ]
    expect(facetCountsDescending(words).map((f) => f.key)).toEqual([
      'verb',
      'nomen:der',
      'nomen:die',
      'nomen:das',
    ])
  })

  it('keeps a noun with no article as a plain ungendered facet', () => {
    // Older imports predate the required-attribute rule; they must still be
    // counted and filterable rather than silently vanishing.
    const words = [noun(1), noun(2, 'der')]
    expect(facetCountsDescending(words)).toEqual([
      { key: 'nomen:der', type: 'nomen', artikel: 'der', count: 1 },
      { key: 'nomen', type: 'nomen', artikel: null, count: 1 },
    ])
  })

  it('ignores a malformed article rather than inventing a facet', () => {
    const words = [{ id: 1, type: 'nomen', attrs: { artikel: 'DER' } } as unknown as Word]
    expect(facetCountsDescending(words).map((f) => f.key)).toEqual(['nomen'])
  })

  it('leaves out facets with no words', () => {
    expect(facetCountsDescending([other(1, 'phrase')]).map((f) => f.key)).toEqual(['phrase'])
  })

  it('breaks ties on the fixed facet order so the row does not reshuffle', () => {
    const a = facetCountsDescending([other(1, 'verb'), noun(2, 'die'), other(3, 'adjektiv')])
    const b = facetCountsDescending([other(3, 'adjektiv'), other(1, 'verb'), noun(2, 'die')])
    expect(a.map((f) => f.key)).toEqual(['nomen:die', 'verb', 'adjektiv'])
    expect(a).toEqual(b)
  })

  it('returns nothing for an empty collection', () => {
    expect(facetCountsDescending([])).toEqual([])
  })
})

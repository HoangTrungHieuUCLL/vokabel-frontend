import { describe, expect, it } from 'vitest'
import { historyFacets, wordsAddedByDay } from './stats'
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

describe('historyFacets', () => {
  function noun(id: number, artikel?: string): Word {
    return { id, type: 'nomen', attrs: artikel ? { artikel } : {} } as unknown as Word
  }
  function other(id: number, type: WordType): Word {
    return { id, type, attrs: {} } as unknown as Word
  }

  it('orders facets from most to fewest words', () => {
    const words = [other(1, 'verb'), other(2, 'verb'), other(3, 'verb'), other(4, 'adjektiv')]
    expect(historyFacets(words)).toEqual([
      { kind: 'type', type: 'verb', count: 3 },
      { kind: 'type', type: 'adjektiv', count: 1 },
    ])
  })

  it('keeps nouns as one facet carrying the total and the gender split', () => {
    const words = [noun(1, 'der'), noun(2, 'die'), noun(3, 'die'), noun(4, 'das'), noun(5, 'das'), noun(6, 'das')]
    expect(historyFacets(words)).toEqual([
      {
        kind: 'nouns',
        count: 6,
        genders: [
          { artikel: 'das', count: 3 },
          { artikel: 'die', count: 2 },
          { artikel: 'der', count: 1 },
        ],
      },
    ])
  })

  it('ranks the noun group by its total, not by any one gender', () => {
    // Four nouns beat three verbs as a group, even though no single gender does.
    const words = [
      noun(1, 'der'),
      noun(2, 'der'),
      noun(3, 'die'),
      noun(4, 'das'),
      other(5, 'verb'),
      other(6, 'verb'),
      other(7, 'verb'),
    ]
    const [first, second] = historyFacets(words)
    expect(first).toMatchObject({ kind: 'nouns', count: 4 })
    expect(second).toMatchObject({ kind: 'type', type: 'verb', count: 3 })
  })

  it('counts an article-less noun in the total but gives it no gender segment', () => {
    // Older imports predate the required-attribute rule; they must still be
    // reachable through the Nomen total rather than vanishing.
    const words = [noun(1), noun(2, 'der')]
    expect(historyFacets(words)).toEqual([
      { kind: 'nouns', count: 2, genders: [{ artikel: 'der', count: 1 }] },
    ])
  })

  it('omits genders that have no words', () => {
    const [facet] = historyFacets([noun(1, 'die')])
    expect(facet).toEqual({ kind: 'nouns', count: 1, genders: [{ artikel: 'die', count: 1 }] })
  })

  it('leaves out types with no words', () => {
    expect(historyFacets([other(1, 'phrase')])).toEqual([{ kind: 'type', type: 'phrase', count: 1 }])
  })

  it('breaks ties on the fixed type order so the row does not reshuffle', () => {
    const a = historyFacets([other(1, 'verb'), noun(2, 'die'), other(3, 'adjektiv')])
    const b = historyFacets([other(3, 'adjektiv'), other(1, 'verb'), noun(2, 'die')])
    expect(a.map((f) => (f.kind === 'nouns' ? 'nomen' : f.type))).toEqual(['nomen', 'verb', 'adjektiv'])
    expect(a).toEqual(b)
  })

  it('returns nothing for an empty collection', () => {
    expect(historyFacets([])).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'
import { typeCountsDescending, wordsAddedByDay } from './stats'
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

describe('typeCountsDescending', () => {
  function wordsOf(spec: Partial<Record<WordType, number>>): Word[] {
    const words: Word[] = []
    let id = 1
    for (const [type, count] of Object.entries(spec)) {
      for (let i = 0; i < (count ?? 0); i++) {
        words.push({ id: id++, type: type as WordType } as Word)
      }
    }
    return words
  }

  it('orders types from most to fewest words', () => {
    const result = typeCountsDescending(wordsOf({ adjektiv: 2, nomen: 5, verb: 3 }))
    expect(result).toEqual([
      { type: 'nomen', count: 5 },
      { type: 'verb', count: 3 },
      { type: 'adjektiv', count: 2 },
    ])
  })

  it('leaves out types with no words', () => {
    const result = typeCountsDescending(wordsOf({ phrase: 1 }))
    expect(result).toEqual([{ type: 'phrase', count: 1 }])
  })

  it('breaks ties on the fixed type order so the row does not reshuffle', () => {
    const a = typeCountsDescending(wordsOf({ verb: 2, adjektiv: 2, nomen: 2 }))
    const b = typeCountsDescending(wordsOf({ adjektiv: 2, nomen: 2, verb: 2 }))
    expect(a.map((c) => c.type)).toEqual(['nomen', 'verb', 'adjektiv'])
    expect(a).toEqual(b)
  })

  it('returns nothing for an empty collection', () => {
    expect(typeCountsDescending([])).toEqual([])
  })
})

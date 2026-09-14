import { describe, expect, it } from 'vitest'
import { makeSearchKey } from './searchKey'
import { searchWords, type Searchable } from './search'

function word(id: number, w: string, meaning = '', example: string | null = null, tags: string[] = []): Searchable {
  return { id, word: w, search_key: makeSearchKey(w), meaning, example, tags }
}

describe('searchWords', () => {
  it('"uben" finds "üben" as the top hit', () => {
    const items = [word(1, 'üben')]
    const results = searchWords(items, 'uben')
    expect(results[0]?.item.word).toBe('üben')
  })

  it('"strasse" finds "die Straße" as the top hit', () => {
    const items = [word(1, 'die Straße')]
    const results = searchWords(items, 'strasse')
    expect(results[0]?.item.word).toBe('die Straße')
  })

  it('"Entschuldigng" finds "Entschuldigung"', () => {
    const items = [word(1, 'Entschuldigung')]
    const results = searchWords(items, 'Entschuldigng')
    expect(results[0]?.item.word).toBe('Entschuldigung')
  })

  it('"hut" finds "Hut" but not "gut", "tut" or "Hund"', () => {
    const items = [word(1, 'Hut'), word(2, 'gut'), word(3, 'tut'), word(4, 'Hund')]
    const results = searchWords(items, 'hut')
    expect(results.map((r) => r.item.word)).toEqual(['Hut'])
  })

  it('"erinnern" finds an entry stored as "sich erinnern"', () => {
    const items = [word(1, 'sich erinnern')]
    const results = searchWords(items, 'erinnern')
    expect(results[0]?.item.word).toBe('sich erinnern')
  })

  it('ranks exact above prefix above fuzzy above substring', () => {
    const items = [
      word(1, 'Fahrrad', 'used for a reise'), // substring match only, via meaning
      word(2, 'reisen', 'to travel'), // prefix match for "reise"
      word(3, 'Reise', 'trip'), // exact match for "reise"
      word(4, 'Reisc', 'typo-ish'), // distance-1 fuzzy match
    ]
    const results = searchWords(items, 'reise')
    expect(results.map((r) => r.item.id)).toEqual([3, 2, 4, 1])
  })

  it('falls back to a meaning substring match', () => {
    const items = [word(1, 'Buch', 'book about cooking')]
    const results = searchWords(items, 'cooking')
    expect(results[0]?.field).toBe('meaning')
  })

  it('finds a word by tag name', () => {
    const items = [word(1, 'Buch', 'book', null, ['b1-exam'])]
    const results = searchWords(items, 'b1-exam')
    expect(results[0]?.field).toBe('tag')
    expect(results[0]?.tag).toBe('b1-exam')
  })
})

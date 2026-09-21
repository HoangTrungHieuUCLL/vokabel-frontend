import { describe, expect, it } from 'vitest'
import { FACET_ORDER, artikelOf, facetArtikelOf, facetTypeOf, wordFacetKey } from './artikel'
import type { Word } from '../api/types'

const word = (type: string, attrs: Record<string, unknown> = {}) => ({ type, attrs }) as unknown as Word

describe('artikelOf', () => {
  it('reads a noun article', () => {
    expect(artikelOf(word('nomen', { artikel: 'die' }))).toBe('die')
  })

  it('returns null for a non-noun even if it somehow carries an article', () => {
    expect(artikelOf(word('verb', { artikel: 'der' }))).toBeNull()
  })

  it('returns null for a noun with a missing or invalid article', () => {
    expect(artikelOf(word('nomen'))).toBeNull()
    expect(artikelOf(word('nomen', { artikel: 'Der' }))).toBeNull()
    expect(artikelOf(word('nomen', { artikel: 42 }))).toBeNull()
  })
})

describe('wordFacetKey', () => {
  it('buckets a gendered noun under its article', () => {
    expect(wordFacetKey(word('nomen', { artikel: 'das' }))).toBe('nomen:das')
  })

  it('buckets an ungendered noun under the plain type', () => {
    expect(wordFacetKey(word('nomen'))).toBe('nomen')
  })

  it('buckets everything else under its type', () => {
    expect(wordFacetKey(word('phrase'))).toBe('phrase')
  })
})

describe('facet key parsing', () => {
  it('recovers the type and article from a key', () => {
    expect(facetTypeOf('nomen:der')).toBe('nomen')
    expect(facetArtikelOf('nomen:der')).toBe('der')
    expect(facetTypeOf('verb')).toBe('verb')
    expect(facetArtikelOf('verb')).toBeNull()
  })
})

describe('FACET_ORDER', () => {
  it('covers every key wordFacetKey can produce, so tie-breaking is never -1', () => {
    for (const key of ['nomen:der', 'nomen:die', 'nomen:das', 'nomen', 'verb', 'phrase']) {
      expect(FACET_ORDER).toContain(key)
    }
  })

  it('puts the three genders where Nomen sat, ahead of Verb', () => {
    expect(FACET_ORDER.slice(0, 5)).toEqual(['nomen:der', 'nomen:die', 'nomen:das', 'nomen', 'verb'])
  })
})

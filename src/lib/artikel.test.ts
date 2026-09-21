import { describe, expect, it } from 'vitest'
import { artikelOf, facetArtikelOf, facetTypeOf, matchesFacet, wordFacetKey } from './artikel'
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

describe('matchesFacet', () => {
  it('matches every noun under the bare nomen key, which backs the group total', () => {
    expect(matchesFacet(word('nomen', { artikel: 'die' }), 'nomen')).toBe(true)
    expect(matchesFacet(word('nomen'), 'nomen')).toBe(true)
    expect(matchesFacet(word('verb'), 'nomen')).toBe(false)
  })

  it('narrows to one gender under a gendered key', () => {
    expect(matchesFacet(word('nomen', { artikel: 'die' }), 'nomen:die')).toBe(true)
    expect(matchesFacet(word('nomen', { artikel: 'der' }), 'nomen:die')).toBe(false)
    expect(matchesFacet(word('nomen'), 'nomen:die')).toBe(false)
  })

  it('matches other types by their own key', () => {
    expect(matchesFacet(word('phrase'), 'phrase')).toBe(true)
    expect(matchesFacet(word('phrase'), 'verb')).toBe(false)
  })
})

import type { Word } from '../api/types'
import type { WordType } from './wordTypes'

export const ARTIKEL = ['der', 'die', 'das'] as const

export type Artikel = (typeof ARTIKEL)[number]

export const ARTIKEL_COLOR_VAR: Record<Artikel, string> = {
  der: '--color-artikel-der',
  die: '--color-artikel-die',
  das: '--color-artikel-das',
}

function isArtikel(value: unknown): value is Artikel {
  return typeof value === 'string' && (ARTIKEL as readonly string[]).includes(value)
}

/**
 * The gender of a noun, or null for anything else.
 *
 * `attrs` is untyped on the wire and the backend has only required `artikel`
 * since the attribute spec landed, so a noun imported before that can still
 * arrive without one. Everything here degrades to a plain, ungendered noun
 * rather than guessing.
 */
export function artikelOf(word: Pick<Word, 'type' | 'attrs'>): Artikel | null {
  if (word.type !== 'nomen') return null
  const value = word.attrs?.artikel
  return isArtikel(value) ? value : null
}

/**
 * How a word is bucketed by the History filter: its type, except that nouns
 * split by gender.
 *
 * Counting and filtering both go through this one function, so a chip's count
 * can never disagree with the list it produces.
 */
export function wordFacetKey(word: Pick<Word, 'type' | 'attrs'>): string {
  const artikel = artikelOf(word)
  return artikel ? `nomen:${artikel}` : word.type
}

/**
 * Whether a word belongs under a filter key.
 *
 * The bare "nomen" key means every noun, gendered or not -- it backs the
 * total on the noun chip group. The gendered keys narrow to one article.
 */
export function matchesFacet(word: Pick<Word, 'type' | 'attrs'>, key: string): boolean {
  if (key === 'nomen') return word.type === 'nomen'
  return wordFacetKey(word) === key
}

export function facetTypeOf(key: string): WordType {
  return key.startsWith('nomen:') ? 'nomen' : (key as WordType)
}

export function facetArtikelOf(key: string): Artikel | null {
  const [, artikel] = key.split(':')
  return isArtikel(artikel) ? artikel : null
}

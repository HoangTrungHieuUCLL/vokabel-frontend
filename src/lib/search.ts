import { makeSearchKey } from './searchKey'

// Allowed typos scale with the length of the *dictionary* word being
// compared against, not the query: a short query like "uben" (4 chars)
// only becomes a distance-1 match of "üben" (search_key "ueben", 5 chars)
// because the bound is computed from the 5-char candidate. A flat
// tolerance of 2 would make "hut" match "gut", "tut" and "Haut", which
// buries the word you actually wanted -- short words are reachable by
// prefix matching instead.
export function maxDist(len: number): number {
  return Math.min(2, Math.floor((len - 1) / 4))
}

// Bounded edit distance: exits early once a row's minimum already exceeds
// maxDistance, and returns maxDistance + 1 (a sentinel "too far") rather
// than the true distance in that case.
export function boundedLevenshtein(a: string, b: string, maxDistance: number): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

  let prevRow = Array.from({ length: b.length + 1 }, (_, j) => j)

  for (let i = 1; i <= a.length; i++) {
    const currRow = new Array<number>(b.length + 1)
    currRow[0] = i
    let rowMin = currRow[0]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      currRow[j] = Math.min(prevRow[j] + 1, currRow[j - 1] + 1, prevRow[j - 1] + cost)
      if (currRow[j] < rowMin) rowMin = currRow[j]
    }
    if (rowMin > maxDistance) return maxDistance + 1
    prevRow = currRow
  }

  return prevRow[b.length]
}

export type MatchField = 'word' | 'meaning' | 'example' | 'tag'

export interface Searchable {
  id: number
  word: string
  search_key: string
  meaning: string
  example: { de: string; meaning: string }[]
  tags: string[]
}

export interface SearchMatch<T extends Searchable> {
  item: T
  rank: 0 | 1 | 2 | 3
  distance: number
  field: MatchField
  start: number
  end: number
  /** The matched tag or example sentence itself -- present when field is 'tag' or 'example', since those don't live directly on the item as a single string. */
  matchText?: string
}

/** Ranks: 0 exact search_key, 1 prefix, 2 bounded Levenshtein, 3 substring in meaning/example. */
export function searchWords<T extends Searchable>(items: T[], rawQuery: string): SearchMatch<T>[] {
  const query = rawQuery.trim()
  if (!query) return []
  const key = makeSearchKey(query)
  if (!key) return []
  const lowerQuery = query.toLowerCase()

  const matches: SearchMatch<T>[] = []

  for (const item of items) {
    if (item.search_key === key) {
      matches.push({ item, rank: 0, distance: 0, field: 'word', start: 0, end: item.word.length })
      continue
    }

    if (item.search_key.startsWith(key)) {
      matches.push({ item, rank: 1, distance: 0, field: 'word', start: 0, end: key.length })
      continue
    }

    const bound = maxDist(item.search_key.length)
    if (bound > 0) {
      const distance = boundedLevenshtein(key, item.search_key, bound)
      if (distance <= bound) {
        matches.push({ item, rank: 2, distance, field: 'word', start: 0, end: item.word.length })
        continue
      }
    }

    const tagMatch = item.tags.find((tag) => tag.toLowerCase().includes(lowerQuery))
    if (tagMatch) {
      const idx = tagMatch.toLowerCase().indexOf(lowerQuery)
      matches.push({ item, rank: 3, distance: 0, field: 'tag', start: idx, end: idx + query.length, matchText: tagMatch })
      continue
    }

    const meaningIdx = item.meaning.toLowerCase().indexOf(lowerQuery)
    if (meaningIdx >= 0) {
      matches.push({
        item,
        rank: 3,
        distance: 0,
        field: 'meaning',
        start: meaningIdx,
        end: meaningIdx + query.length,
      })
      continue
    }

    const exampleMatch = item.example.find((ex) => ex.de.toLowerCase().includes(lowerQuery))
    if (exampleMatch) {
      const idx = exampleMatch.de.toLowerCase().indexOf(lowerQuery)
      matches.push({
        item,
        rank: 3,
        distance: 0,
        field: 'example',
        start: idx,
        end: idx + query.length,
        matchText: exampleMatch.de,
      })
    }
  }

  return matches.sort((a, b) => a.rank - b.rank || a.distance - b.distance)
}

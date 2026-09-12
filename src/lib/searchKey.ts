const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }
const LEADING = /^(der|die|das|ein|eine|einen|einem|einer|sich|zu)\s+/

// Mirrors app/normalize.py::make_search_key on the backend exactly. Every
// write on the backend and every keystroke here must normalize identically,
// or "uben" will stop finding "üben".
export function makeSearchKey(word: string): string {
  let s = word
    .trim()
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => UMLAUTS[c])

  let prev: string | null = null
  while (prev !== s) {
    prev = s
    s = s.replace(LEADING, '').trim()
  }

  return s.replace(/[^a-z0-9 ]/g, '')
}

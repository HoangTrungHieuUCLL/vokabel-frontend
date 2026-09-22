/**
 * Font size for a word shown as the detail-page headline.
 *
 * German compounds get long -- "Ausgangssituation",
 * "Geschwindigkeitsbegrenzung" -- and at the full display size they wrap
 * mid-word, stranding a letter or two on a line of their own.
 *
 * The metric is the longest *unbreakable* run, not the total length: a phrase
 * like "Es kommt darauf an." is long but wraps happily at its spaces, so it
 * should keep the full size. Only a single long token needs shrinking.
 */
export function headlineSizeClass(word: string): string {
  const longestToken = word
    .split(/\s+/)
    .reduce((longest, token) => Math.max(longest, token.length), 0)

  if (longestToken <= 12) return 'text-[28px]'
  if (longestToken <= 18) return 'text-[22px]'
  return 'text-[18px]'
}

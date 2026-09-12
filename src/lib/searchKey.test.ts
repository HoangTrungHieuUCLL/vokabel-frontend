import { describe, expect, it } from 'vitest'
import { makeSearchKey } from './searchKey'

describe('makeSearchKey', () => {
  const cases: [string, string][] = [
    ['üben', 'ueben'],
    ['die Straße', 'strasse'],
    ['sich erinnern', 'erinnern'],
    ['sich zu erinnern', 'erinnern'],
    ['Entschuldigung!', 'entschuldigung'],
    ['an|rufen', 'anrufen'],
  ]

  for (const [input, expected] of cases) {
    it(`"${input}" -> "${expected}"`, () => {
      expect(makeSearchKey(input)).toBe(expected)
    })
  }
})

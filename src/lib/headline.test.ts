import { describe, expect, it } from 'vitest'
import { headlineSizeClass } from './headline'

describe('headlineSizeClass', () => {
  it('keeps the full size for an ordinary word', () => {
    expect(headlineSizeClass('Haus')).toBe('text-[28px]')
    expect(headlineSizeClass('verstehen')).toBe('text-[28px]')
  })

  it('steps down for a long compound', () => {
    // The reported case: at full size this stranded "N" on its own line.
    expect(headlineSizeClass('Ausgangssituation')).toBe('text-[22px]')
  })

  it('steps down further for a very long compound', () => {
    expect(headlineSizeClass('Geschwindigkeitsbegrenzung')).toBe('text-[18px]')
  })

  it('measures the longest token, not the whole string', () => {
    // A phrase is long overall but breaks at its spaces, so it keeps the
    // full size -- shrinking on total length would wrongly demote it.
    expect(headlineSizeClass('Es kommt darauf an.')).toBe('text-[28px]')
    expect(headlineSizeClass('Ich bin mir nicht sicher.')).toBe('text-[28px]')
  })

  it('shrinks a phrase only when one of its words is itself long', () => {
    expect(headlineSizeClass('die Ausgangssituation')).toBe('text-[22px]')
  })

  it('handles an empty string without blowing up', () => {
    expect(headlineSizeClass('')).toBe('text-[28px]')
  })
})

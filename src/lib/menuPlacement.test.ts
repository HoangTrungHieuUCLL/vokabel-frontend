import { describe, expect, it } from 'vitest'
import { shouldAlignLeft } from './menuPlacement'

describe('shouldAlignLeft', () => {
  it('keeps the usual rightwards anchor when there is room to the left', () => {
    // Button at the right of a 390px screen: the menu fits hanging leftwards.
    expect(shouldAlignLeft(374)).toBe(false)
  })

  it('flips when the button sits near the left edge', () => {
    // The reported bug: the button wrapped to x=16, so a 160px menu hanging
    // left would have started at -100.
    expect(shouldAlignLeft(60)).toBe(true)
  })

  it('flips exactly at the point the menu would breach the margin', () => {
    expect(shouldAlignLeft(168)).toBe(false)
    expect(shouldAlignLeft(167)).toBe(true)
  })

  it('flips for a button flush against the left edge', () => {
    expect(shouldAlignLeft(0)).toBe(true)
  })
})

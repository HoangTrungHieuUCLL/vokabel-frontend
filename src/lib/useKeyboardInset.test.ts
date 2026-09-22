import { describe, expect, it } from 'vitest'
import { computeKeyboardInset } from './useKeyboardInset'

describe('computeKeyboardInset', () => {
  it('is zero with the keyboard closed', () => {
    // Visual viewport fills the layout viewport.
    expect(computeKeyboardInset(844, 844, 0)).toBe(0)
  })

  it('reports the covered height when the keyboard is open', () => {
    // iOS keeps the layout viewport at 844 and shrinks the visual one.
    expect(computeKeyboardInset(844, 508, 0)).toBe(336)
  })

  it('accounts for the visual viewport being scrolled', () => {
    // iOS shifts the visual viewport to reveal a focused field; without
    // subtracting offsetTop the bar would be lifted too far.
    expect(computeKeyboardInset(844, 508, 100)).toBe(236)
  })

  it('ignores sub-pixel noise rather than jittering the bar', () => {
    expect(computeKeyboardInset(844, 843.6, 0)).toBe(0)
  })

  it('clamps rubber-band scrolling, which can overshoot negative', () => {
    expect(computeKeyboardInset(844, 900, 0)).toBe(0)
  })

  it('rounds to whole pixels', () => {
    expect(computeKeyboardInset(844, 507.4, 0)).toBe(337)
  })

  it('is zero for nonsense input rather than NaN', () => {
    expect(computeKeyboardInset(Number.NaN, 508, 0)).toBe(0)
  })
})

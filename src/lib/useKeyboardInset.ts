import { useEffect, useState } from 'react'

/**
 * How much of the bottom of the screen is covered, given the layout viewport
 * height and the visual viewport's height and scroll offset.
 *
 * Split out from the hook so the arithmetic -- the part that is easy to get
 * subtly wrong -- can be tested without a real keyboard.
 */
export function computeKeyboardInset(
  layoutHeight: number,
  visualHeight: number,
  visualOffsetTop: number,
): number {
  const covered = layoutHeight - (visualHeight + visualOffsetTop)
  // Sub-pixel noise and rubber-band scrolling both produce small negative or
  // fractional values that would jitter a fixed element.
  if (!Number.isFinite(covered) || covered < 1) return 0
  return Math.round(covered)
}

function currentInset(): number {
  if (typeof window === 'undefined' || !window.visualViewport) return 0
  const vv = window.visualViewport
  return computeKeyboardInset(window.innerHeight, vv.height, vv.offsetTop)
}

/**
 * Height of the on-screen keyboard, in px, or 0 when it is closed.
 *
 * iOS does not shrink the layout viewport when the keyboard opens -- only the
 * visual viewport -- so anything `position: fixed` to the bottom stays pinned
 * underneath the keyboard rather than riding above it. (Android Chrome does
 * resize the layout viewport, which is why the bug is iOS-specific.) Callers
 * lift their fixed bars by this amount.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(currentInset)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => setInset(currentInset())
    // `scroll` matters as well as `resize`: iOS shifts the visual viewport
    // when it scrolls a focused field into view, without resizing it.
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}

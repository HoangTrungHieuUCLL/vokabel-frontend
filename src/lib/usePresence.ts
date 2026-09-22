import { useEffect, useState } from 'react'

export interface Presence {
  /** Whether to render at all. Stays true through the exit animation. */
  mounted: boolean
  /** True while the exit animation is playing. */
  leaving: boolean
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Keeps a conditionally-rendered element alive long enough to animate out.
 *
 * React unmounts as soon as the condition flips, so `{open && <Thing/>}` can
 * only ever animate in -- the exit is a jump cut. This defers the unmount by
 * the exit duration and reports when the exit is running, so the caller can
 * swap in the outgoing animation class.
 *
 * Under prefers-reduced-motion the exit is skipped: the global CSS disables
 * the animation anyway, so waiting for it would leave an invisible element
 * sitting on screen and swallowing taps.
 */
export function usePresence(open: boolean, exitMs: number): Presence {
  // Only the tail of the exit needs state; everything else is derived during
  // render, so opening costs no extra render pass.
  const [exitDone, setExitDone] = useState(true)

  if (open && exitDone) setExitDone(false)

  const skipExit = prefersReducedMotion()
  const lingering = !exitDone && !skipExit
  const leaving = !open && lingering

  useEffect(() => {
    if (!leaving) return
    const timer = setTimeout(() => setExitDone(true), exitMs)
    return () => clearTimeout(timer)
  }, [leaving, exitMs])

  return { mounted: open || leaving, leaving }
}

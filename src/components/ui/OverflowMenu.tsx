import { useEffect, useRef, useState } from 'react'
import { MENU_WIDTH, shouldAlignLeft } from '../../lib/menuPlacement'
import { usePresence } from '../../lib/usePresence'
import { MoreIcon } from '../icons'

interface OverflowMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

const EXIT_MS = 120

/** "..." button that reveals a small dropdown of actions, for actions that don't need to sit next to the content all the time. */
export function OverflowMenu({ items, ariaLabel }: { items: OverflowMenuItem[]; ariaLabel: string }) {
  const [open, setOpen] = useState(false)
  // The menu normally hangs left from the button's right edge. Near the left
  // of the screen that would put it off-screen, so it flips to hang right.
  const [alignLeft, setAlignLeft] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { mounted, leaving } = usePresence(open, EXIT_MS)

  // Decided in the click handler rather than after render, so the menu is
  // never painted in the wrong place and then corrected.
  const toggle = () => {
    if (!open && buttonRef.current) {
      const { right } = buttonRef.current.getBoundingClientRect()
      setAlignLeft(shouldAlignLeft(right))
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    // pointerdown rather than mousedown: it covers touch directly instead of
    // relying on the synthesised mouse event a tap may or may not produce.
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="tap-target flex items-center justify-center rounded-full border-2 border-ink bg-surface press"
      >
        <MoreIcon className="h-5 w-5" />
      </button>
      {mounted && (
        <div
          role="menu"
          style={{ width: MENU_WIDTH }}
          className={`absolute z-30 mt-1.5 overflow-hidden rounded-[var(--radius-control)] border-2 border-ink bg-surface shadow-[var(--shadow-pop)] ${
            alignLeft ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          } ${leaving ? 'animate-dialog-out' : 'animate-dialog-in'}`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`block w-full px-4 py-3 text-left text-[14px] font-semibold active:bg-surface-alt ${
                item.danger ? 'text-negative-text' : 'text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

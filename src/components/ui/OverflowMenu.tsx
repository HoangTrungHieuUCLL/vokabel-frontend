import { useEffect, useRef, useState } from 'react'
import { MoreIcon } from '../icons'

interface OverflowMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

/** "..." button that reveals a small dropdown of actions, for actions that don't need to sit next to the content all the time. */
export function OverflowMenu({ items, ariaLabel }: { items: OverflowMenuItem[]; ariaLabel: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="tap-target flex items-center justify-center rounded-full border-2 border-ink bg-surface press"
      >
        <MoreIcon className="h-5 w-5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-40 overflow-hidden rounded-[var(--radius-control)] border-2 border-ink bg-surface shadow-[var(--shadow-pop)]"
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

import { useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '../icons'

interface AccordionProps {
  title: string
  defaultOpen?: boolean
  /** Controlled open state -- pass together with onToggle to coordinate a single-open group. Omit for independent, self-managed accordions. */
  open?: boolean
  onToggle?: () => void
  children: ReactNode
}

export function Accordion({ title, defaultOpen = false, open: openProp, onToggle, children }: AccordionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : internalOpen

  function handleClick() {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalOpen((o) => !o)
    }
  }

  return (
    <div className="sticker rounded-[var(--radius-card)] bg-surface">
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        className="tap-target flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="headline text-[20px]">{title}</span>
        <ChevronDownIcon className={`h-5 w-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="flex flex-col gap-5 border-t-2 border-ink px-4 py-4">{children}</div>}
    </div>
  )
}

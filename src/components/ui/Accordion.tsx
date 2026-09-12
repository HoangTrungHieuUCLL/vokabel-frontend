import { useState, type ReactNode } from 'react'
import { ChevronDownIcon } from '../icons'

export function Accordion({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="sticker rounded-[var(--radius-card)] bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
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

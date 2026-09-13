import { useMemo, useState } from 'react'
import { Input } from './Input'

interface TagsInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  /** All distinct tags already used elsewhere, offered as click-to-add suggestions. */
  suggestions: string[]
}

/** Comma-separated tags input with a suggestion tray for tags already used on other words. */
export function TagsInput({ id, label, value, onChange, suggestions }: TagsInputProps) {
  const [open, setOpen] = useState(false)

  const rawSegments = value.split(',')
  const priorTags = rawSegments
    .slice(0, -1)
    .map((s) => s.trim())
    .filter(Boolean)
  const active = rawSegments[rawSegments.length - 1].trim().toLowerCase()
  const usedLower = new Set(priorTags.map((t) => t.toLowerCase()))

  const filtered = useMemo(
    () =>
      suggestions
        .filter((tag) => !usedLower.has(tag.toLowerCase()))
        .filter((tag) => active === '' || tag.toLowerCase().includes(active))
        .slice(0, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suggestions, active, priorTags.join('|')],
  )

  function pick(tag: string) {
    onChange([...priorTags, tag].join(', ') + ', ')
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        id={id}
        label={label}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1.5 flex w-full flex-wrap gap-1.5 rounded-[var(--radius-control)] border-2 border-ink bg-surface p-2 shadow-[var(--shadow-pop)]">
          {filtered.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(tag)}
              className="press rounded-full border-2 border-ink bg-surface-alt px-2.5 py-1 text-[12px] font-bold text-ink-secondary"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

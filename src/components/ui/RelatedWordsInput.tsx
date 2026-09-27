import { useMemo, useState } from 'react'
import { Input } from './Input'
import { XIcon } from '../icons'
import { makeSearchKey } from '../../lib/searchKey'
import type { Word } from '../../api/types'

interface RelatedWordsInputProps {
  id: string
  label: string
  placeholder?: string
  value: string[]
  onChange: (value: string[]) => void
  /** Words already recorded, offered as click-to-add suggestions while typing. */
  words: Word[]
  /** The word being edited, left out of its own suggestions. */
  excludeId?: number
}

/**
 * Related words/phrases as chips. Free text is added with Enter (or on blur);
 * while typing, recorded words that match are offered to pick instead, the
 * same way TagsInput offers existing tags. Entries are kept as plain strings
 * -- phrases can contain commas, so there is no comma separator here.
 */
export function RelatedWordsInput({ id, label, placeholder, value, onChange, words, excludeId }: RelatedWordsInputProps) {
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(false)

  const usedKeys = new Set(value.map(makeSearchKey))
  const query = draft.trim().toLowerCase()
  const queryKey = makeSearchKey(draft)

  const suggestions = useMemo(() => {
    if (!query) return []
    return words
      .filter((w) => w.id !== excludeId && w.deleted_at === null)
      .filter((w) => !usedKeys.has(w.search_key))
      .filter((w) => w.word.toLowerCase().includes(query) || (queryKey !== '' && w.search_key.includes(queryKey)))
      .sort((a, b) => Number(b.search_key.startsWith(queryKey)) - Number(a.search_key.startsWith(queryKey)))
      .slice(0, 8)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, query, queryKey, excludeId, value.join('|')])

  function add(text: string) {
    const trimmed = text.trim()
    setDraft('')
    if (!trimmed || usedKeys.has(makeSearchKey(trimmed))) return
    onChange([...value, trimmed])
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          id={id}
          label={label}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            add(draft)
            setTimeout(() => setOpen(false), 150)
          }}
          autoComplete="off"
          enterKeyHint="done"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1.5 flex w-full flex-wrap gap-1.5 rounded-[var(--radius-control)] border-2 border-ink bg-surface p-2 shadow-[var(--shadow-pop)]">
            {suggestions.map((w) => (
              <button
                key={w.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(w.word)}
                className="press rounded-full border-2 border-ink bg-surface-alt px-2.5 py-1 text-[12px] font-bold text-ink-secondary"
              >
                {w.word}
              </button>
            ))}
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border-2 border-ink bg-surface-alt py-0.5 pl-2.5 pr-1 text-[12px] font-bold text-ink-secondary"
            >
              {item}
              <button type="button" aria-label={`${item} ×`} onClick={() => remove(i)} className="rounded-full p-0.5">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

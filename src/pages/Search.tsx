import { useEffect, useMemo, useRef, useState } from 'react'
import { WordRow } from '../components/WordRow'
import { SearchIcon } from '../components/icons'
import { useI18n } from '../i18n/I18nContext'
import { searchWords } from '../lib/search'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import { useWords } from '../state/WordsContext'

export function Search() {
  const { t } = useI18n()
  const { words, loading, hardCount, toggleHard } = useWords()
  const [query, setQuery] = useState('')
  const [hardOnly, setHardOnly] = useState(false)
  const debouncedQuery = useDebouncedValue(query, 150)
  const inputRef = useRef<HTMLInputElement>(null)

  // Autofocus on desktop only -- on mobile the keyboard would cover the
  // list the instant the screen opens.
  useEffect(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      inputRef.current?.focus()
    }
  }, [])

  const pool = useMemo(() => (hardOnly ? words.filter((w) => w.is_hard) : words), [words, hardOnly])

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return pool.map((item) => ({ item, rank: 0 as const, distance: 0, field: 'word' as const, start: 0, end: item.word.length }))
    }
    return searchWords(pool, debouncedQuery)
  }, [pool, debouncedQuery])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-12 w-full rounded-[var(--radius-control)] border-2 border-ink bg-surface pl-10 pr-3.5 text-[16px] text-ink placeholder:text-ink-placeholder focus:outline-none focus:ring-4 focus:ring-accent-soft focus:border-accent"
          />
        </div>
        <button
          type="button"
          onClick={() => setHardOnly((h) => !h)}
          aria-pressed={hardOnly}
          className={`tap-target press shrink-0 rounded-[var(--radius-control)] border-2 border-ink px-3 font-display text-[13px] font-extrabold uppercase tracking-[0.03em] ${
            hardOnly ? 'bg-negative text-white shadow-[var(--shadow-pop)]' : 'bg-surface text-ink'
          }`}
        >
          {t('search.hard')} ({hardCount})
        </button>
      </div>

      {loading && words.length === 0 && <p className="text-[14px] text-ink-tertiary">{t('search.loading')}</p>}

      {!loading && results.length === 0 && (
        <p className="text-[14px] text-ink-tertiary">{words.length === 0 ? t('search.emptyDb') : t('search.noResults')}</p>
      )}

      <ul className="flex flex-col gap-2">
        {results.map((r) => (
          <WordRow
            key={r.item.id}
            word={r.item}
            onToggleHard={() => toggleHard(r.item.id)}
            matchField={r.field}
            matchStart={r.start}
            matchEnd={r.end}
          />
        ))}
      </ul>
    </div>
  )
}

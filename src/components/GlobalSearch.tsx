import { useMemo } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { searchWords } from '../lib/search'
import { useWords } from '../state/WordsContext'
import { WordRow } from './WordRow'
import { SearchIcon } from './icons'

interface SearchBarProps {
  query: string
  onQueryChange: (value: string) => void
  hardOnly: boolean
  onToggleHard: () => void
  inputRef?: React.Ref<HTMLInputElement>
}

/** The bar itself, rendered twice by the shell: floating on mobile, inline on desktop. */
export function SearchBar({ query, onQueryChange, hardOnly, onToggleHard, inputRef }: SearchBarProps) {
  const { t } = useI18n()
  const { hardCount } = useWords()

  return (
    <>
      <SearchIcon className="pointer-events-none h-5 w-5 shrink-0 text-ink-tertiary" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
        className="h-8 min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-ink-placeholder focus:outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label={t('search.clear')}
          className="tap-target shrink-0 px-1 text-[18px] leading-none text-ink-tertiary"
        >
          ×
        </button>
      )}
      <button
        type="button"
        onClick={onToggleHard}
        aria-pressed={hardOnly}
        className={`tap-target shrink-0 rounded-full px-3 font-display text-[12px] font-extrabold uppercase tracking-[0.03em] ${
          hardOnly ? 'bg-negative text-white' : 'text-ink-tertiary'
        }`}
      >
        {t('search.hard')} ({hardCount})
      </button>
    </>
  )
}

/**
 * Results for the always-visible search bar.
 *
 * The shell renders this over the current tab rather than navigating, and
 * keeps the tab mounted underneath, so searching mid-way through adding a word
 * never costs you the form you were filling in.
 */
export function SearchResults({ query, hardOnly }: { query: string; hardOnly: boolean }) {
  const { t } = useI18n()
  const { words, toggleHard } = useWords()

  const pool = useMemo(() => (hardOnly ? words.filter((w) => w.is_hard) : words), [words, hardOnly])

  const results = useMemo(() => {
    const trimmed = query.trim()
    // With no query the bar is still doing something useful when the hard
    // filter is on: it lists everything flagged hard to remember. Those rows
    // carry no match to highlight.
    if (!trimmed) {
      return pool.map((item) => ({ item, field: undefined, start: undefined, end: undefined, matchText: undefined }))
    }
    return searchWords(pool, trimmed)
  }, [pool, query])

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] text-ink-tertiary">
        {results.length} {results.length === 1 ? t('history.record') : t('history.records')}
      </p>
      {results.length === 0 ? (
        <p className="text-[14px] text-ink-tertiary">{t('search.noResults')}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {results.map((r) => (
            <WordRow
              key={r.item.id}
              word={r.item}
              onToggleHard={() => toggleHard(r.item.id)}
              matchField={r.field}
              matchStart={r.start}
              matchEnd={r.end}
              matchText={r.matchText}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

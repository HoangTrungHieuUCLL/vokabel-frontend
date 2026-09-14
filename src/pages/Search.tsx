import { useEffect, useMemo, useRef, useState } from 'react'
import { WordOfDayCard } from '../components/dashboard/WordOfDayCard'
import { DailyLineChart } from '../components/dashboard/DailyLineChart'
import { TypeCountsBars } from '../components/dashboard/TypeCountsBars'
import { WordRow } from '../components/WordRow'
import { Card } from '../components/ui/Card'
import { SearchIcon } from '../components/icons'
import { useI18n } from '../i18n/I18nContext'
import { searchWords } from '../lib/search'
import { countsByType, pickWordOfDay, wordsAddedByDay } from '../lib/stats'
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
  const showDashboard = !debouncedQuery.trim() && !hardOnly

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return []
    return searchWords(pool, debouncedQuery)
  }, [pool, debouncedQuery])

  const wordOfDay = useMemo(() => pickWordOfDay(words), [words])
  const typeCounts = useMemo(() => countsByType(words), [words])
  const dailyCounts = useMemo(() => wordsAddedByDay(words, 30), [words])
  const addedTotal = useMemo(() => dailyCounts.reduce((sum, d) => sum + d.count, 0), [dailyCounts])

  const searchBar = (
    <>
      <SearchIcon className="pointer-events-none h-5 w-5 shrink-0 text-ink-tertiary" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search.placeholder')}
        className="h-8 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-placeholder focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setHardOnly((h) => !h)}
        aria-pressed={hardOnly}
        className={`tap-target shrink-0 rounded-full px-3 font-display text-[12px] font-extrabold uppercase tracking-[0.03em] ${
          hardOnly ? 'bg-negative text-white' : 'text-ink-tertiary'
        }`}
      >
        {t('search.hard')} ({hardCount})
      </button>
    </>
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: floating bright pill -- same height, shape and gap as the nav below it. */}
      <div
        className="fixed inset-x-3 z-20 flex h-16 items-center gap-2 rounded-full border-2 border-ink bg-surface px-4 shadow-[0_8px_20px_rgba(20,20,20,0.2)] md:hidden"
        style={{ bottom: 'calc(max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem)) + 4.75rem)' }}
      >
        {searchBar}
      </div>

      {/* Desktop: plain inline bar, no floating chrome needed with a sidebar layout. */}
      <div className="hidden items-center gap-2 rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3 py-1 text-ink md:flex">
        {searchBar}
      </div>

      {loading && words.length === 0 && <p className="text-[14px] text-ink-tertiary">{t('search.loading')}</p>}

      {showDashboard ? (
        <div className="flex flex-col gap-4">
          {wordOfDay && <WordOfDayCard word={wordOfDay} />}

          <Card className="flex flex-col gap-2">
            <p className="eyebrow text-[12px] text-ink-tertiary">{t('dashboard.byType')}</p>
            <TypeCountsBars counts={typeCounts} />
          </Card>

          <Card className="flex flex-col gap-2">
            <p className="eyebrow text-[12px] text-ink-tertiary">{t('dashboard.addedPerDay')}</p>
            <DailyLineChart data={dailyCounts} />
            <p className="text-[12px] text-ink-tertiary">
              {addedTotal} {t('dashboard.addedTotal')}
            </p>
          </Card>

          {!loading && words.length === 0 && <p className="text-[14px] text-ink-tertiary">{t('search.emptyDb')}</p>}
        </div>
      ) : (
        <>
          {!loading && results.length === 0 && <p className="text-[14px] text-ink-tertiary">{t('search.noResults')}</p>}
          <ul className="flex flex-col gap-2">
            {(debouncedQuery.trim()
              ? results
              : pool.map((item) => ({ item, rank: 0 as const, distance: 0, field: 'word' as const, start: 0, end: item.word.length, tag: undefined }))
            ).map((r) => (
              <WordRow
                key={r.item.id}
                word={r.item}
                onToggleHard={() => toggleHard(r.item.id)}
                matchField={r.field}
                matchStart={r.start}
                matchEnd={r.end}
                matchTag={r.tag}
              />
            ))}
          </ul>
        </>
      )}

      {/* Clears the floating search bar, which sits above the bottom nav on mobile. */}
      <div className="h-16 shrink-0 md:hidden" />
    </div>
  )
}

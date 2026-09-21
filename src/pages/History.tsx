import { useMemo, useState } from 'react'
import { TypeDonut } from '../components/charts/TypeDonut'
import { DailyLineChart } from '../components/dashboard/DailyLineChart'
import { TypeFilterChips } from '../components/history/TypeFilterChips'
import { WordRow } from '../components/WordRow'
import { Card } from '../components/ui/Card'
import { useI18n } from '../i18n/I18nContext'
import { facetTypeOf, matchesFacet } from '../lib/artikel'
import { countsByType, historyFacets, wordsAddedByDay } from '../lib/stats'
import { useWords } from '../state/WordsContext'

export function History() {
  const { t } = useI18n()
  const { words, loading, toggleHard } = useWords()
  const [selected, setSelected] = useState<string | null>(null)

  const facets = useMemo(() => historyFacets(words), [words])
  const typeCounts = useMemo(() => countsByType(words), [words])
  const dailyCounts = useMemo(() => wordsAddedByDay(words, 30), [words])

  // `words` arrives newest-first from WordsContext, so filtering preserves the
  // recency order a history view wants without a second sort. Counting and
  // filtering both route through the facet helpers, so a chip's number can
  // never disagree with the list it opens.
  const visible = useMemo(
    () => (selected === null ? words : words.filter((w) => matchesFacet(w, selected))),
    [words, selected],
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="headline text-[32px]">{t('history.title')}</h1>

      {words.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex flex-col gap-1.5 !p-3">
            <p className="eyebrow text-[11px] text-ink-tertiary">{t('dashboard.byType')}</p>
            <TypeDonut
              counts={typeCounts}
              activeType={selected ? facetTypeOf(selected) : null}
              onSelect={(type) => setSelected(selected === type ? null : type)}
            />
          </Card>

          <Card className="flex flex-col gap-1.5 !p-3">
            <p className="eyebrow text-[11px] text-ink-tertiary">{t('dashboard.addedPerDay')}</p>
            <div className="flex flex-1 items-center">
              <DailyLineChart data={dailyCounts} />
            </div>
          </Card>
        </div>
      )}

      <TypeFilterChips facets={facets} total={words.length} selected={selected} onSelect={setSelected} />

      {loading && words.length === 0 ? (
        <p className="text-[14px] text-ink-tertiary">{t('search.loading')}</p>
      ) : words.length === 0 ? (
        <p className="text-[14px] text-ink-tertiary">{t('search.emptyDb')}</p>
      ) : (
        <>
          <p className="text-[12px] text-ink-tertiary">
            {visible.length} {visible.length === 1 ? t('history.record') : t('history.records')}
          </p>
          <ul className="flex flex-col gap-2">
            {visible.map((word) => (
              <WordRow key={word.id} word={word} onToggleHard={() => toggleHard(word.id)} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

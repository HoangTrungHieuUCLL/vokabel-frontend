import { useMemo, useState } from 'react'
import { TypeFilterChips } from '../components/history/TypeFilterChips'
import { WordRow } from '../components/WordRow'
import { useI18n } from '../i18n/I18nContext'
import { typeCountsDescending } from '../lib/stats'
import type { WordType } from '../lib/wordTypes'
import { useWords } from '../state/WordsContext'

export function History() {
  const { t } = useI18n()
  const { words, loading, toggleHard } = useWords()
  const [selected, setSelected] = useState<WordType | null>(null)

  const counts = useMemo(() => typeCountsDescending(words), [words])
  // `words` arrives newest-first from WordsContext, so filtering preserves the
  // recency order a history view wants without a second sort.
  const visible = useMemo(
    () => (selected === null ? words : words.filter((w) => w.type === selected)),
    [words, selected],
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="headline text-[32px]">{t('history.title')}</h1>

      <TypeFilterChips counts={counts} total={words.length} selected={selected} onSelect={setSelected} />

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

import { Link } from 'react-router-dom'
import type { Word } from '../../api/types'
import { useI18n } from '../../i18n/I18nContext'
import { TypeChip } from '../ui/TypeChip'

export function WordOfDayCard({ word }: { word: Word }) {
  const { t } = useI18n()
  return (
    <Link
      to={`/word/${word.id}`}
      className="sticker flex flex-col gap-2 rounded-[var(--radius-card)] bg-highlight-soft px-4 py-3 press"
    >
      <span className="eyebrow text-[11px] text-ink-tertiary">{t('dashboard.wordOfDay')}</span>
      <div className="flex items-center gap-2">
        <TypeChip type={word.type} />
        <span className="text-[20px] font-bold text-ink">{word.word}</span>
      </div>
      <p className="text-[14px] text-ink-secondary">{word.meaning}</p>
      {word.example && <p className="text-[13px] italic text-ink-tertiary">{word.example}</p>}
    </Link>
  )
}

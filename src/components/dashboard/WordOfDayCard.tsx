import { Link } from 'react-router-dom'
import type { Spotlight } from '../../api/types'
import { useI18n } from '../../i18n/I18nContext'
import { artikelOf } from '../../lib/artikel'
import { formatSlotTime } from '../../lib/push'
import { TypeChip } from '../ui/TypeChip'

/**
 * The word the most recent notification carried. The server owns the pick, so
 * this card and the phone never disagree about what the current word is.
 */
export function WordOfDayCard({ spotlight }: { spotlight: Spotlight }) {
  const { t, locale } = useI18n()
  const { word } = spotlight
  const nextAt = formatSlotTime(spotlight.next_slot_at, locale)

  return (
    <Link
      to={`/word/${word.id}`}
      className="sticker flex flex-col gap-2 rounded-[var(--radius-card)] bg-highlight-soft px-4 py-3 press"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="eyebrow text-[11px] text-ink-tertiary">{t('dashboard.spotlight')}</span>
        {nextAt && (
          <span className="text-[11px] text-ink-tertiary tabular-nums">
            {t('dashboard.nextWord')} {nextAt}
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        <TypeChip type={word.type} artikel={artikelOf(word)} />
        <span className="text-[20px] font-bold text-ink">{word.word}</span>
      </div>
      <p className="text-[14px] text-ink-secondary">{word.meaning}</p>
      {word.example[0] && <p className="text-[13px] italic text-ink-tertiary">{word.example[0].de}</p>}
    </Link>
  )
}

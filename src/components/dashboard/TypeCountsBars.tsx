import { useI18n } from '../../i18n/I18nContext'
import { TYPE_ABBR, TYPE_COLOR_VAR, TYPE_LABEL_KEY, WORD_TYPES } from '../../lib/wordTypes'
import type { WordType } from '../../lib/wordTypes'

export function TypeCountsBars({ counts }: { counts: Record<WordType, number> }) {
  const { t } = useI18n()
  const max = Math.max(1, ...Object.values(counts))

  return (
    <div className="flex flex-col gap-1.5">
      {WORD_TYPES.map((type) => {
        const count = counts[type]
        const colorVar = `var(${TYPE_COLOR_VAR[type]})`
        return (
          <div key={type} className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-[10px] font-extrabold uppercase text-ink-tertiary">{TYPE_ABBR[type]}</span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-alt">
              <div
                className="h-full rounded-full"
                style={{ width: `${(count / max) * 100}%`, background: colorVar }}
              />
            </div>
            <span className="w-5 shrink-0 text-right text-[12px] font-bold text-ink">{count}</span>
            <span className="sr-only">{t(TYPE_LABEL_KEY[type])}</span>
          </div>
        )
      })}
    </div>
  )
}

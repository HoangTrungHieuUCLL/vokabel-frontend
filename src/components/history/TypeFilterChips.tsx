import { useI18n } from '../../i18n/I18nContext'
import { TYPE_ABBR, TYPE_COLOR_VAR, TYPE_LABEL_KEY } from '../../lib/wordTypes'
import type { WordType } from '../../lib/wordTypes'
import type { TypeCount } from '../../lib/stats'

interface TypeFilterChipsProps {
  counts: TypeCount[]
  total: number
  selected: WordType | null
  onSelect: (type: WordType | null) => void
}

interface ChipProps {
  label: string
  abbr?: string
  count: number
  colorVar?: string
  selected: boolean
  onClick: () => void
}

function Chip({ label, abbr, count, colorVar, selected, onClick }: ChipProps) {
  const color = colorVar ? `var(${colorVar})` : 'var(--color-ink)'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        background: selected ? color : `color-mix(in srgb, ${color} 14%, white)`,
        color: selected ? '#ffffff' : color,
      }}
      className="tap-target press inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink px-3 font-display text-[12px] font-extrabold uppercase tracking-[0.03em]"
    >
      {abbr && <span className="opacity-70">{abbr}</span>}
      <span className="normal-case tracking-normal">{label}</span>
      <span
        className="rounded-full px-1.5 py-0.5 text-[11px] tabular-nums"
        style={{
          background: selected ? 'rgba(255,255,255,0.25)' : `color-mix(in srgb, ${color} 22%, white)`,
        }}
      >
        {count}
      </span>
    </button>
  )
}

/**
 * The type filter for the History tab. Types are ordered by how many words
 * each holds, most first, and a type with no words is not offered at all —
 * so the row is both a filter and a at-a-glance breakdown of the collection.
 */
export function TypeFilterChips({ counts, total, selected, onSelect }: TypeFilterChipsProps) {
  const { t } = useI18n()

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      <div className="flex w-max gap-2 md:w-auto md:flex-wrap">
        <Chip
          label={t('history.all')}
          count={total}
          selected={selected === null}
          onClick={() => onSelect(null)}
        />
        {counts.map(({ type, count }) => (
          <Chip
            key={type}
            label={t(TYPE_LABEL_KEY[type])}
            abbr={TYPE_ABBR[type]}
            count={count}
            colorVar={TYPE_COLOR_VAR[type]}
            selected={selected === type}
            // Tapping the active chip clears the filter, so getting back to
            // "everything" never needs a trip to the far-left All chip.
            onClick={() => onSelect(selected === type ? null : type)}
          />
        ))}
      </div>
    </div>
  )
}

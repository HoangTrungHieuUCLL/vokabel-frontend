import { useI18n } from '../../i18n/I18nContext'
import { ARTIKEL_COLOR_VAR, type Artikel } from '../../lib/artikel'
import { TYPE_ABBR, TYPE_COLOR_VAR, TYPE_LABEL_KEY, type WordType } from '../../lib/wordTypes'
import type { HistoryFacet } from '../../lib/stats'

interface TypeFilterChipsProps {
  facets: HistoryFacet[]
  total: number
  selected: string | null
  onSelect: (key: string | null) => void
}

function Count({ count, selected, color }: { count: number; selected: boolean; color: string }) {
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[11px] tabular-nums"
      style={{
        background: selected ? 'rgba(255,255,255,0.25)' : `color-mix(in srgb, ${color} 22%, white)`,
      }}
    >
      {count}
    </span>
  )
}

interface ChipProps {
  label: string
  abbr?: string
  count: number
  color: string
  selected: boolean
  onClick: () => void
}

function Chip({ label, abbr, count, color, selected, onClick }: ChipProps) {
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
      <Count count={count} selected={selected} color={color} />
    </button>
  )
}

/**
 * Nouns as one unit: the total, then a segment per gender, inside a single
 * bordered pill. Keeping them together means the four numbers can be read as
 * a breakdown -- 8 nouns, of which 5 das -- instead of four chips scattered
 * across the row by their individual counts.
 */
function NounGroupChip({
  count,
  genders,
  selected,
  onSelect,
}: {
  count: number
  genders: { artikel: Artikel; count: number }[]
  selected: string | null
  onSelect: (key: string | null) => void
}) {
  const { t } = useI18n()
  const nounColor = `var(${TYPE_COLOR_VAR.nomen})`
  const totalSelected = selected === 'nomen'

  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-surface p-1">
      <button
        type="button"
        onClick={() => onSelect(totalSelected ? null : 'nomen')}
        aria-pressed={totalSelected}
        style={{
          background: totalSelected ? nounColor : `color-mix(in srgb, ${nounColor} 14%, white)`,
          color: totalSelected ? '#ffffff' : nounColor,
        }}
        className="tap-target press inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 font-display text-[12px] font-extrabold uppercase tracking-[0.03em]"
      >
        <span className="opacity-70">{TYPE_ABBR.nomen}</span>
        <span className="normal-case tracking-normal">{t(TYPE_LABEL_KEY.nomen)}</span>
        <Count count={count} selected={totalSelected} color={nounColor} />
      </button>

      {genders.map(({ artikel, count: genderCount }) => {
        const key = `nomen:${artikel}`
        const isSelected = selected === key
        const color = `var(${ARTIKEL_COLOR_VAR[artikel]})`
        return (
          <button
            key={artikel}
            type="button"
            onClick={() => onSelect(isSelected ? null : key)}
            aria-pressed={isSelected}
            style={{
              background: isSelected ? color : `color-mix(in srgb, ${color} 14%, white)`,
              color: isSelected ? '#ffffff' : color,
            }}
            className="tap-target press inline-flex shrink-0 items-center gap-1 rounded-full px-2 font-display text-[12px] font-extrabold tracking-[0.03em]"
          >
            <span>{artikel}</span>
            <Count count={genderCount} selected={isSelected} color={color} />
          </button>
        )
      })}
    </div>
  )
}

/**
 * The filter for the History tab. Facets are ordered by how many words each
 * holds, most first, and a facet with no words is not offered at all -- so the
 * row is both a filter and an at-a-glance breakdown of the collection. It
 * doubles as the legend for the donut above it: same colours, same order.
 */
export function TypeFilterChips({ facets, total, selected, onSelect }: TypeFilterChipsProps) {
  const { t } = useI18n()

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      <div className="flex w-max items-center gap-2 md:w-auto md:flex-wrap">
        <Chip
          label={t('history.all')}
          count={total}
          color="var(--color-ink)"
          selected={selected === null}
          onClick={() => onSelect(null)}
        />
        {facets.map((facet) =>
          facet.kind === 'nouns' ? (
            <NounGroupChip
              key="nouns"
              count={facet.count}
              genders={facet.genders}
              selected={selected}
              onSelect={onSelect}
            />
          ) : (
            <Chip
              key={facet.type}
              label={t(TYPE_LABEL_KEY[facet.type])}
              abbr={TYPE_ABBR[facet.type]}
              count={facet.count}
              color={`var(${TYPE_COLOR_VAR[facet.type as WordType]})`}
              selected={selected === facet.type}
              // Tapping the active chip clears the filter, so getting back to
              // "everything" never needs a trip to the far-left All chip.
              onClick={() => onSelect(selected === facet.type ? null : facet.type)}
            />
          ),
        )}
      </div>
    </div>
  )
}

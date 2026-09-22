import { useState } from 'react'
import { useI18n } from '../../i18n/I18nContext'
import { TYPE_COLOR_VAR, TYPE_LABEL_KEY, WORD_TYPES, type WordType } from '../../lib/wordTypes'

const SIZE = 120
const R_OUTER = 54
const R_INNER = 34
const CENTER = SIZE / 2
/** Surface-coloured separator so adjacent slices never blend into one shape. */
const GAP_DEGREES = 1.6

function polar(radius: number, degrees: number) {
  const rad = ((degrees - 90) * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function arcPath(from: number, to: number): string {
  const outerStart = polar(R_OUTER, from)
  const outerEnd = polar(R_OUTER, to)
  const innerEnd = polar(R_INNER, to)
  const innerStart = polar(R_INNER, from)
  const largeArc = to - from > 180 ? 1 : 0
  return [
    `M${outerStart.x.toFixed(2)},${outerStart.y.toFixed(2)}`,
    `A${R_OUTER},${R_OUTER} 0 ${largeArc} 1 ${outerEnd.x.toFixed(2)},${outerEnd.y.toFixed(2)}`,
    `L${innerEnd.x.toFixed(2)},${innerEnd.y.toFixed(2)}`,
    `A${R_INNER},${R_INNER} 0 ${largeArc} 0 ${innerStart.x.toFixed(2)},${innerStart.y.toFixed(2)}`,
    'Z',
  ].join(' ')
}

interface TypeDonutProps {
  counts: Record<WordType, number>
  /** Highlights one type; the rest fade back. Used to tie the donut to the filter row. */
  activeType?: WordType | null
  onSelect?: (type: WordType) => void
}

/**
 * Words by type, as a share of the collection.
 *
 * There are nine types, more than a pie comfortably carries, so this leans on
 * the filter chips directly beneath it as its legend: same colours, same
 * order, with the labels and counts spelled out. Slices are not labelled in
 * place -- at this size the text would collide -- but each one names itself on
 * hover and through its accessible title, so the chart is never colour-alone.
 */
export function TypeDonut({ counts, activeType, onSelect }: TypeDonutProps) {
  const { t } = useI18n()
  const [hovered, setHovered] = useState<WordType | null>(null)

  const present = WORD_TYPES.filter((type) => counts[type] > 0)
  const total = present.reduce((sum, type) => sum + counts[type], 0)

  if (total === 0) return null

  // Cumulative boundaries first, then the gapped arcs -- no running counter to
  // reassign mid-render.
  const bounds = present.reduce<number[]>(
    (acc, type) => [...acc, acc[acc.length - 1] + (counts[type] / total) * 360],
    [0],
  )
  const slices = present.map((type, i) => {
    const [from, to] = [bounds[i], bounds[i + 1]]
    // A lone slice must not be gapped into a visibly broken ring.
    const gap = present.length > 1 ? Math.min(GAP_DEGREES, (to - from) / 3) : 0
    return { type, from: from + gap / 2, to: to - gap / 2 }
  })

  const focused = hovered ?? activeType ?? null
  const label = focused ? t(TYPE_LABEL_KEY[focused]) : null
  const value = focused ? counts[focused] : total

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[160px]"
        role="img"
        aria-label={t('dashboard.byType')}
      >
        {slices.map(({ type, from, to }, i) => {
          const dimmed = focused !== null && focused !== type
          return (
            <path
              key={type}
              className="animate-slice-in"
              d={arcPath(from, to)}
              fill={`var(${TYPE_COLOR_VAR[type]})`}
              opacity={dimmed ? 0.3 : 1}
              style={{
                cursor: onSelect ? 'pointer' : undefined,
                transition: 'opacity 120ms',
                // Slices arrive in turn, so the ring draws itself rather than
                // appearing whole.
                animationDelay: `${i * 35}ms`,
              }}
              onMouseEnter={() => setHovered(type)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect?.(type)}
            >
              <title>{`${t(TYPE_LABEL_KEY[type])}: ${counts[type]}`}</title>
            </path>
          )
        })}
        <text
          x={CENTER}
          y={CENTER - 1}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-ink font-display text-[20px] font-extrabold"
        >
          {value}
        </text>
      </svg>
      <p className="h-4 truncate text-[11px] text-ink-tertiary">{label ?? ''}</p>
    </div>
  )
}

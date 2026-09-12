import { TYPE_ABBR, TYPE_COLOR_VAR, TYPE_LABEL, type WordType } from '../../lib/wordTypes'

interface TypeChipProps {
  type: WordType
  selected?: boolean
  onClick?: () => void
  showLabel?: boolean
  size?: 'sm' | 'md'
}

/**
 * Colour is never the only signal: every chip renders the two-letter
 * abbreviation (or the full German label) regardless of the muted per-type
 * background, so the nine types stay distinguishable without relying on
 * colour perception alone.
 */
export function TypeChip({ type, selected, onClick, showLabel = false, size = 'sm' }: TypeChipProps) {
  const colorVar = `var(${TYPE_COLOR_VAR[type]})`
  const style = {
    '--chip-color': colorVar,
    background: selected
      ? colorVar
      : `color-mix(in srgb, ${colorVar} 16%, white)`,
    color: selected ? '#ffffff' : colorVar,
  } as React.CSSProperties

  const Tag = onClick ? 'button' : 'span'
  const sizeClasses = size === 'md' ? 'h-10 px-3 text-[13px] gap-1.5' : 'h-7 px-2 text-[11px] gap-1'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={style}
      className={`tap-target inline-flex items-center justify-center rounded-full border-2 border-ink font-display font-extrabold uppercase tracking-[0.03em] ${sizeClasses} ${onClick ? 'press' : ''}`}
    >
      <span>{TYPE_ABBR[type]}</span>
      {showLabel && <span className="normal-case tracking-normal">{TYPE_LABEL[type]}</span>}
    </Tag>
  )
}

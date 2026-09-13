import { useI18n } from '../../i18n/I18nContext'
import type { TranslationKey } from '../../i18n/translations'
import type { Cell, Grid, Label } from '../../lib/tabellenData'
import { CASE_COLOR_VAR, CASE_LABEL_KEY, type Case } from '../../lib/tabellenData'

const LABEL_TO_CASE: Partial<Record<TranslationKey, Case>> = {
  'case.nom': 'nom',
  'case.akk': 'akk',
  'case.dat': 'dat',
  'case.gen': 'gen',
}

function labelText(t: (key: TranslationKey) => string, label: Label): string {
  return typeof label === 'string' ? label : t(label.key)
}

function CaseDot({ label }: { label: Label }) {
  const key = typeof label === 'string' ? undefined : label.key
  const c = key ? LABEL_TO_CASE[key] : undefined
  if (!c) return null
  return <span className="dot" style={{ background: `var(${CASE_COLOR_VAR[c]})` }} />
}

function cellContent(cell: Cell) {
  if (typeof cell === 'string') return cell
  return cell.deviates ? <strong className="font-extrabold">{cell.text}</strong> : cell.text
}

/**
 * caseAxis "columns": the grid's columns are case names (person on rows).
 * caseAxis "rows": the grid's row labels are case names (gender on columns).
 * Colour is always paired with the text label -- never colour alone.
 */
export function GridTable({ grid, caseAxis }: { grid: Grid; caseAxis: 'columns' | 'rows' | 'none' }) {
  const { t } = useI18n()
  // table-fixed + a colgroup forces every column (including the row-label
  // column) to respect the container's width instead of growing to fit its
  // content -- an ordinary auto-layout table would rather overflow than
  // wrap, which is exactly the horizontal scroll the spec forbids at 380px.
  const dataColWidth = `${72 / grid.columns.length}%`
  return (
    <table className="w-full table-fixed border-collapse text-[12px]">
      <colgroup>
        <col style={{ width: '28%' }} />
        {grid.columns.map((_, i) => (
          <col key={i} style={{ width: dataColWidth }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="p-1 text-left text-ink-tertiary" />
          {grid.columns.map((col, i) => (
            <th key={i} className="p-1 text-left align-bottom font-display text-[10px] font-extrabold uppercase leading-tight tracking-[0.01em] text-ink">
              {caseAxis === 'columns' ? (
                <span className="inline-flex flex-wrap items-center gap-1">
                  <CaseDot label={col} />
                  {labelText(t, col)}
                </span>
              ) : (
                labelText(t, col)
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.rows.map((row, i) => (
          <tr key={i} className="border-t-2 border-border-soft">
            <th className="p-1 text-left align-top font-display text-[10px] font-extrabold uppercase leading-tight tracking-[0.01em] text-ink-secondary">
              {caseAxis === 'rows' ? (
                <span className="inline-flex flex-wrap items-center gap-1">
                  <CaseDot label={row.label} />
                  {labelText(t, row.label)}
                </span>
              ) : (
                labelText(t, row.label)
              )}
            </th>
            {row.cells.map((cell, j) => (
              <td key={j} className="p-1 align-top text-ink">
                {cellContent(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function CaseLegend() {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-secondary">
      {(Object.keys(CASE_LABEL_KEY) as Case[]).map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5">
          <span className="dot" style={{ background: `var(${CASE_COLOR_VAR[c]})` }} />
          {t(CASE_LABEL_KEY[c])}
        </span>
      ))}
    </div>
  )
}

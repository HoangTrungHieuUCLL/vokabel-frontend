import type { Grid } from '../../lib/tabellenData'
import { CASE_COLOR_VAR, CASE_LABEL, type Case } from '../../lib/tabellenData'

const LABEL_TO_CASE: Record<string, Case> = {
  Nominativ: 'nom',
  Akkusativ: 'akk',
  Dativ: 'dat',
  Genitiv: 'gen',
}

function CaseDot({ label }: { label: string }) {
  const c = LABEL_TO_CASE[label]
  if (!c) return null
  return <span className="dot" style={{ background: `var(${CASE_COLOR_VAR[c]})` }} />
}

function cellContent(cell: string | { text: string; deviates?: boolean }) {
  if (typeof cell === 'string') return cell
  return cell.deviates ? <strong className="font-extrabold">{cell.text}</strong> : cell.text
}

/**
 * caseAxis "columns": the grid's columns are case names (person on rows).
 * caseAxis "rows": the grid's row labels are case names (gender on columns).
 * Colour is always paired with the text label -- never colour alone.
 */
export function GridTable({ grid, caseAxis }: { grid: Grid; caseAxis: 'columns' | 'rows' | 'none' }) {
  // table-fixed + a colgroup forces every column (including the row-label
  // column) to respect the container's width instead of growing to fit its
  // content -- an ordinary auto-layout table would rather overflow than
  // wrap, which is exactly the horizontal scroll the spec forbids at 380px.
  const dataColWidth = `${72 / grid.columns.length}%`
  return (
    <table className="w-full table-fixed border-collapse text-[12px]">
      <colgroup>
        <col style={{ width: '28%' }} />
        {grid.columns.map((col) => (
          <col key={col} style={{ width: dataColWidth }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th className="p-1 text-left text-ink-tertiary" />
          {grid.columns.map((col) => (
            <th key={col} className="p-1 text-left align-bottom font-display text-[10px] font-extrabold uppercase leading-tight tracking-[0.01em] text-ink">
              {caseAxis === 'columns' ? (
                <span className="inline-flex flex-wrap items-center gap-1">
                  <CaseDot label={col} />
                  {col}
                </span>
              ) : (
                col
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {grid.rows.map((row) => (
          <tr key={row.label} className="border-t-2 border-border-soft">
            <th className="p-1 text-left align-top font-display text-[10px] font-extrabold uppercase leading-tight tracking-[0.01em] text-ink-secondary">
              {caseAxis === 'rows' ? (
                <span className="inline-flex flex-wrap items-center gap-1">
                  <CaseDot label={row.label} />
                  {row.label}
                </span>
              ) : (
                row.label
              )}
            </th>
            {row.cells.map((cell, i) => (
              <td key={i} className="p-1 align-top text-ink">
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
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-secondary">
      {(Object.keys(CASE_LABEL) as Case[]).map((c) => (
        <span key={c} className="inline-flex items-center gap-1.5">
          <span className="dot" style={{ background: `var(${CASE_COLOR_VAR[c]})` }} />
          {CASE_LABEL[c]}
        </span>
      ))}
    </div>
  )
}

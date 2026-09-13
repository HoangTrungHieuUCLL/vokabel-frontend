import type { DailyCount } from '../../lib/stats'

const WIDTH = 300
const HEIGHT = 90
const PAD = 8

export function DailyLineChart({ data }: { data: DailyCount[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  const stepX = (WIDTH - PAD * 2) / Math.max(1, data.length - 1)

  const points = data.map((d, i) => {
    const x = PAD + i * stepX
    const y = HEIGHT - PAD - (d.count / max) * (HEIGHT - PAD * 2)
    return { x, y, count: d.count }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Line chart of words added per day">
      <line x1={PAD} y1={HEIGHT - PAD} x2={WIDTH - PAD} y2={HEIGHT - PAD} stroke="var(--color-border-soft)" strokeWidth="1" />
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) =>
        p.count > 0 ? <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--color-accent)" /> : null,
      )}
    </svg>
  )
}

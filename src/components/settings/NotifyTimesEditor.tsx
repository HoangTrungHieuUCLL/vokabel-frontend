import { useState } from 'react'
import * as api from '../../api/client'
import type { NotifySettings } from '../../api/types'
import { useI18n } from '../../i18n/I18nContext'
import { formatSlots } from '../../lib/push'
import { Button } from '../ui/Button'
import { XIcon } from '../icons'

/** A sensible next suggestion when adding a row, rather than defaulting to 00:00. */
function suggestTime(existing: string[]): string {
  const taken = new Set(existing)
  for (const candidate of ['09:00', '12:00', '15:00', '18:00', '22:00', '07:00', '20:00']) {
    if (!taken.has(candidate)) return candidate
  }
  for (let hour = 0; hour < 24; hour++) {
    const candidate = `${String(hour).padStart(2, '0')}:00`
    if (!taken.has(candidate)) return candidate
  }
  return '12:00'
}

interface NotifyTimesEditorProps {
  settings: NotifySettings
  onSaved: (next: NotifySettings) => void
}

export function NotifyTimesEditor({ settings, onSaved }: NotifyTimesEditorProps) {
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<string[]>(settings.slots)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = () => {
    setDraft(settings.slots)
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    // The server sorts and de-duplicates too, but catching it here keeps the
    // list from silently shrinking under the user after a save.
    const cleaned = [...new Set(draft.filter(Boolean))]
    if (cleaned.length === 0) {
      setError(t('notify.needOneTime'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      onSaved(await api.saveNotifySettings(cleaned))
      setEditing(false)
    } catch {
      setError(t('notify.failed'))
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-[13px] text-ink-tertiary">
          <span className="font-bold text-ink">{t('notify.slotsLabel')}:</span>{' '}
          <span className="tabular-nums">{formatSlots(settings.slots)}</span>{' '}
          <span className="text-[11px]">({settings.timezone})</span>
        </p>
        <button
          type="button"
          onClick={open}
          className="press-icon rounded-full font-display text-[12px] font-extrabold uppercase tracking-[0.03em] text-accent underline underline-offset-2"
        >
          {t('notify.changeTimes')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12px] text-ink-tertiary">{settings.timezone}</p>

      <ul className="flex flex-col gap-2">
        {draft.map((slot, i) => (
          // Index as key: the rows are positional and a time can repeat
          // mid-edit, so the value is not a stable identity here.
          <li key={i} className="flex items-center gap-2">
            <input
              type="time"
              value={slot}
              aria-label={`${t('notify.slotsLabel')} ${i + 1}`}
              onChange={(e) =>
                setDraft((prev) => prev.map((s, j) => (j === i ? e.target.value : s)))
              }
              className="h-12 flex-1 rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3 text-[16px] text-ink tabular-nums focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-soft"
            />
            <button
              type="button"
              onClick={() => setDraft((prev) => prev.filter((_, j) => j !== i))}
              aria-label={t('notify.removeTime')}
              disabled={draft.length === 1}
              className="tap-target press-icon flex items-center justify-center rounded-full border-2 border-ink bg-surface text-ink disabled:opacity-40"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {draft.length < settings.max_slots && (
        <button
          type="button"
          onClick={() => setDraft((prev) => [...prev, suggestTime(prev)])}
          className="tap-target press-icon w-fit rounded-[var(--radius-control)] font-display text-[13px] font-extrabold uppercase tracking-[0.03em] text-accent"
        >
          + {t('notify.addTime')}
        </button>
      )}

      {error && <p className="text-[13px] text-negative-text">{error}</p>}

      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? t('notify.working') : t('notify.save')}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
          {t('notify.cancel')}
        </Button>
      </div>
    </div>
  )
}

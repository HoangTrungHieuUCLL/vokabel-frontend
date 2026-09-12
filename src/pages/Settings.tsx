import { useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { TypeChip } from '../components/ui/TypeChip'
import { WORD_TYPES, TYPE_LABEL } from '../lib/wordTypes'
import { useWords } from '../state/WordsContext'

export function Settings() {
  const { username, logout } = useAuth()
  const { words } = useWords()
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  const counts = useMemo(() => {
    const byType = new Map<string, number>()
    for (const w of words) byType.set(w.type, (byType.get(w.type) ?? 0) + 1)
    return byType
  }, [words])

  return (
    <div className="flex flex-col gap-5">
      <h1 className="headline text-[32px]">Einstellungen</h1>

      {username && <p className="text-[13px] text-ink-tertiary">Angemeldet als {username}</p>}

      <Card className="flex flex-col gap-3">
        <p className="eyebrow text-[12px]">Wörter nach Typ</p>
        <p className="text-[13px] text-ink-secondary">
          {words.length} {words.length === 1 ? 'Wort' : 'Wörter'} insgesamt
        </p>
        <div className="flex flex-col gap-2">
          {WORD_TYPES.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TypeChip type={type} />
                <span className="text-[14px] text-ink">{TYPE_LABEL[type]}</span>
              </span>
              <span className="font-display text-[14px] font-extrabold text-ink">{counts.get(type) ?? 0}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button variant="danger" onClick={() => setConfirmingLogout(true)}>
        Abmelden
      </Button>

      {confirmingLogout && (
        <ConfirmDialog
          title="Abmelden?"
          confirmLabel="Abmelden"
          danger
          onConfirm={logout}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </div>
  )
}

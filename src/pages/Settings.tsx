import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { NotificationSettings } from '../components/settings/NotificationSettings'
import { TypeChip } from '../components/ui/TypeChip'
import { UploadIcon } from '../components/icons'
import { useI18n } from '../i18n/I18nContext'
import { WORD_TYPES, TYPE_LABEL_KEY } from '../lib/wordTypes'
import { useWords } from '../state/WordsContext'

export function Settings() {
  const { t, locale, setLocale } = useI18n()
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
      <h1 className="headline text-[32px]">{t('settings.title')}</h1>

      {username && (
        <p className="text-[13px] text-ink-tertiary">
          {t('settings.loggedInAs')} {username}
        </p>
      )}

      <Card className="flex flex-col gap-3">
        <p className="eyebrow text-[12px]">{t('settings.language')}</p>
        <div className="flex gap-2">
          {(['de', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              aria-pressed={locale === l}
              className={`tap-target press flex-1 rounded-[var(--radius-control)] border-2 border-ink font-display text-[13px] font-extrabold uppercase tracking-[0.03em] ${
                locale === l ? 'bg-accent text-white' : 'bg-surface text-ink'
              }`}
            >
              {l === 'de' ? 'Deutsch' : 'English'}
            </button>
          ))}
        </div>
      </Card>

      <NotificationSettings />

      <Card className="flex flex-col gap-3">
        <p className="eyebrow text-[12px]">{t('settings.wordsByType')}</p>
        <p className="text-[13px] text-ink-secondary">
          {words.length} {words.length === 1 ? t('settings.wordSingular') : t('settings.wordPlural')} {t('settings.total')}
        </p>
        <div className="flex flex-col gap-2">
          {WORD_TYPES.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TypeChip type={type} />
                <span className="text-[14px] text-ink">{t(TYPE_LABEL_KEY[type])}</span>
              </span>
              <span className="font-display text-[14px] font-extrabold text-ink">{counts.get(type) ?? 0}</span>
            </div>
          ))}
        </div>
      </Card>

      <Link to="/import">
        <Button variant="secondary" className="w-full">
          <UploadIcon className="h-4 w-4" /> {t('settings.import')}
        </Button>
      </Link>

      <Button variant="danger" onClick={() => setConfirmingLogout(true)}>
        {t('settings.logout')}
      </Button>

      <ConfirmDialog
        open={confirmingLogout}
        title={t('settings.logoutConfirm')}
        confirmLabel={t('settings.logout')}
        danger
        onConfirm={logout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  )
}

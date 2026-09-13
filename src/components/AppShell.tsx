import type { ComponentType, SVGProps } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { useWords } from '../state/WordsContext'
import { BookIcon, GraduationCapIcon, LogoMark, PlusIcon, SearchIcon, SettingsIcon } from './icons'
import { Toast } from './ui/Toast'
import type { TranslationKey } from '../i18n/translations'

interface NavItem {
  to: string
  labelKey: TranslationKey
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.search', Icon: SearchIcon },
  { to: '/add', labelKey: 'nav.add', Icon: PlusIcon },
  { to: '/tabellen', labelKey: 'nav.tabellen', Icon: BookIcon },
  { to: '/grammar', labelKey: 'nav.grammar', Icon: GraduationCapIcon },
]

function Wordmark({ size }: { size: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-2 text-ink">
      <LogoMark className={size === 'md' ? 'h-9 w-9' : 'h-8 w-8'} />
      <span className={`headline ${size === 'md' ? 'text-[24px]' : 'text-[20px]'}`}>Vokabel</span>
    </div>
  )
}

export function AppShell() {
  const { t } = useI18n()
  const location = useLocation()
  const { pendingDelete, undoDelete } = useWords()

  return (
    <div className="flex min-h-dvh w-full flex-col md:flex-row">
      <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-ink bg-bg px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <Wordmark size="md" />
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `tap-target flex items-center gap-3 rounded-[var(--radius-control)] border-2 px-3 font-display text-[15px] font-extrabold uppercase tracking-[0.03em] transition-[background-color,color,box-shadow,border-color] ${
                  isActive
                    ? 'border-ink bg-highlight text-ink shadow-[var(--shadow-pop)]'
                    : 'border-transparent text-ink-secondary hover:border-ink hover:bg-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  {t(labelKey)}
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `tap-target flex items-center gap-3 rounded-[var(--radius-control)] border-2 px-3 font-display text-[15px] font-extrabold uppercase tracking-[0.03em] ${
                isActive
                  ? 'border-ink bg-highlight text-ink shadow-[var(--shadow-pop)]'
                  : 'border-transparent text-ink-secondary hover:border-ink hover:bg-surface'
              }`
            }
          >
            <SettingsIcon className="h-5 w-5" />
            {t('nav.settings')}
          </NavLink>
        </nav>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col">
        <header className="flex items-center justify-between border-b-2 border-ink bg-bg px-4 py-2.5 md:hidden">
          <Wordmark size="sm" />
          <NavLink to="/settings" className="tap-target flex items-center justify-center rounded-full text-ink" aria-label={t('nav.settings')}>
            <SettingsIcon className="h-6 w-6" />
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto pb-36 md:pb-8">
          <div key={location.pathname} className="animate-page-in mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
            <Outlet />
          </div>
        </main>

        <nav
          className="fixed inset-x-3 z-20 flex gap-1 rounded-full border-2 border-ink bg-ink px-2 py-2 shadow-[0_8px_20px_rgba(20,20,20,0.35)] md:hidden"
          style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
        >
          {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={t(labelKey)}
              className={({ isActive }) =>
                `tap-target flex flex-1 items-center justify-center rounded-full py-2 transition-colors ${
                  isActive ? 'bg-highlight text-ink' : 'text-bg/70'
                }`
              }
            >
              {({ isActive }) => <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 1.9} />}
            </NavLink>
          ))}
        </nav>
      </div>

      {pendingDelete && (
        <Toast message={`„${pendingDelete.word}" ${t('toast.deleted')}`} actionLabel={t('toast.undo')} onAction={undoDelete} />
      )}
    </div>
  )
}

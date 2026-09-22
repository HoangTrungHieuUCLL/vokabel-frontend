import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import { useWords } from '../state/WordsContext'
import { SearchBar, SearchResults } from './GlobalSearch'
import { BookIcon, GraduationCapIcon, HistoryIcon, LogoMark, PlusIcon, SearchIcon, SettingsIcon, XIcon } from './icons'
import { Toast } from './ui/Toast'
import type { TranslationKey } from '../i18n/translations'

interface NavItem {
  to: string
  labelKey: TranslationKey
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  { to: '/add', labelKey: 'nav.add', Icon: PlusIcon },
  { to: '/history', labelKey: 'nav.history', Icon: HistoryIcon },
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
  const [query, setQuery] = useState('')
  const [hardOnly, setHardOnly] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  // Whether the mobile input is revealed. Distinct from `searching`: the bar
  // can be open with nothing typed in it yet.
  const [searchOpen, setSearchOpen] = useState(false)

  // Opening the bar should put the cursor in it, or starting a search is two
  // taps instead of one.
  useEffect(() => {
    if (searchOpen) mobileInputRef.current?.focus()
  }, [searchOpen])

  // Opening a result keeps the query alive but must not paint results over the
  // word you just opened -- so the overlay yields on the detail route, and
  // going back brings the same results straight into view again.
  const onDetail = location.pathname.startsWith('/word/')
  const searching = (query.trim().length > 0 || hardOnly) && !onDetail

  // Switching tabs is an explicit fresh start. Handled on the click rather
  // than as an effect on the path, so tapping a result and coming back does
  // not silently throw the search away.
  const clearSearch = () => {
    setQuery('')
    setHardOnly(false)
  }

  const closeSearch = () => {
    clearSearch()
    setSearchOpen(false)
  }

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
              onClick={clearSearch}
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

        <main
          // Only one floating row to clear now; the taller inset applies just
          // while the search input is out.
          className={`flex-1 overflow-y-auto md:pb-28 ${searchOpen ? 'pb-52' : 'pb-32'}`}
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
            {/* Hidden rather than unmounted: searching from halfway through the
                Add form must not throw the form away. */}
            <div key={location.pathname} className={searching ? 'hidden' : 'animate-page-in'}>
              <Outlet />
            </div>
            {searching && (
              <div className="animate-page-in">
                <SearchResults query={query} hardOnly={hardOnly} />
              </div>
            )}
          </div>
        </main>

        {/* Content fades into the paper before it reaches the floating bars
            instead of sliding visibly behind them. A solid fade suits the flat
            poster look better than a frosted blur, and costs nothing to
            scroll past. */}
        <div
          aria-hidden
          // Tall enough that the fade is fully opaque by the time it reaches
          // the topmost bar -- which is higher up while the search input is out.
          className={`pointer-events-none fixed inset-x-0 bottom-0 z-10 md:left-64 md:h-36 ${searchOpen ? 'h-72' : 'h-44'}`}
          style={{ background: 'linear-gradient(to top, var(--color-bg) 62%, transparent)' }}
        />

        {/* Desktop: the bar sits inline above the content, always available. */}
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 hidden justify-center px-8 pb-6 md:flex">
          <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-2 rounded-[var(--radius-control)] border-2 border-ink bg-surface px-3 py-1 text-ink shadow-[var(--shadow-pop)]">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              hardOnly={hardOnly}
              onToggleHard={() => setHardOnly((h) => !h)}
              inputRef={inputRef}
            />
          </div>
        </div>

        {/* Mobile: one row -- the nav pill, with search as its own circle on
            the right. Folding search in here instead of stacking a second
            full-width bar gives back about 76px of every screen, and leaves
            one floating element for content to peek around instead of two. */}
        <div
          className="fixed inset-x-3 z-20 flex items-center gap-2 md:hidden"
          style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
        >
          <nav className="flex h-16 flex-1 items-center gap-1 rounded-full border-2 border-ink bg-ink p-2 shadow-[0_8px_20px_rgba(20,20,20,0.35)]">
            {/* p-2, not px-2: the links are h-full, so horizontal-only padding
                would leave the active pill flush against the bar top and
                bottom while inset 8px at the ends. Uniform padding gives it
                the same 8px on all four sides, and leaves each link exactly
                44px tall -- the minimum tap target. */}
            {NAV_ITEMS.map(({ to, labelKey, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeSearch}
                aria-label={t(labelKey)}
                className={({ isActive }) =>
                  `tap-target flex h-full flex-1 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-highlight text-ink' : 'text-bg/70'
                  }`
                }
              >
                {({ isActive }) => <Icon className="h-6 w-6" strokeWidth={isActive ? 2.4 : 1.9} />}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            aria-label={t('search.placeholder')}
            aria-expanded={searchOpen}
            className={`tap-target press flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-ink shadow-[0_8px_20px_rgba(20,20,20,0.2)] transition-colors ${
              searchOpen ? 'bg-highlight text-ink' : 'bg-surface text-ink'
            }`}
          >
            {searchOpen ? <XIcon className="h-6 w-6" /> : <SearchIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* The input exists only while searching, so it costs no space the
            rest of the time. */}
        {searchOpen && (
          <div
            className="fixed inset-x-3 z-20 flex h-16 items-center gap-2 rounded-full border-2 border-ink bg-surface px-4 shadow-[0_8px_20px_rgba(20,20,20,0.2)] md:hidden"
            style={{ bottom: 'calc(max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem)) + 4.75rem)' }}
          >
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              hardOnly={hardOnly}
              onToggleHard={() => setHardOnly((h) => !h)}
              inputRef={mobileInputRef}
            />
          </div>
        )}
      </div>

      {pendingDelete && (
        <Toast message={`„${pendingDelete.word}" ${t('toast.deleted')}`} actionLabel={t('toast.undo')} onAction={undoDelete} />
      )}
    </div>
  )
}

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { translations, type Locale, type TranslationKey } from './translations'

const STORAGE_KEY = 'vokabel.locale'

function loadLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'de'
}

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(loadLocale)

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next)
    setLocaleState(next)
  }, [])

  const t = useCallback((key: TranslationKey) => translations[locale][key], [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n(): I18nContextValue {
  const ctx = use(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

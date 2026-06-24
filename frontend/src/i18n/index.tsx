import { createContext, useContext, useState, type ReactNode } from 'react'
import { pb } from '@/lib/pocketbase'
import { en } from './en'
import { it } from './it'
import { es } from './es'

const locales = { en, it, es } as const
export type Locale = keyof typeof locales
export type Translations = (typeof locales)[Locale]

const LOCALE_STORAGE_KEY = 'nesto-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'it' || stored === 'es') return stored
  return navigator.language.startsWith('it') ? 'it' : navigator.language.startsWith('es') ? 'es' : 'en'
}

interface I18nContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = (locale: Locale) => {
    setLocaleState(locale)
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    const user = pb.authStore.record
    if (user) {
      pb.collection('users').update(user.id, { language: locale }).catch(() => {})
    }
  }

  const t = locales[locale]

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}

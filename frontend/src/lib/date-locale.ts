import { enUS, it, es } from 'date-fns/locale'
import type { Locale } from '@/i18n'

const localeMap = { en: enUS, it, es } as const

export function dateLocale(locale: Locale) {
  return localeMap[locale]
}

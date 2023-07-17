import { i18n } from '@lingui/core'

import { messages as deMessages } from '@/locales/de.js'
import { messages as enMessages } from '@/locales/en.js'
import { messages as esMessages } from '@/locales/es.js'
import { messages as frMessages } from '@/locales/fr.js'
import { messages as ptMessages } from '@/locales/pt.js'

export const supportedLocales: Record<string, string> = {
  en: 'English',
  pt: 'Portuguese',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
}

const defaultLocale = 'en'

export async function setLocale(locale: string): Promise<void> {
  // eslint-disable-next-line no-prototype-builtins
  if (!supportedLocales.hasOwnProperty(locale)) {
    locale = defaultLocale
  }

  localStorage.setItem('LOCALE', JSON.stringify(locale))

  i18n.activate(locale)
}

export const initLocale = (): void => {
  i18n.load({
    en: enMessages,
    pt: ptMessages,
    es: esMessages,
    fr: frMessages,
    de: deMessages,
  })

  const storedValue = localStorage.getItem('LOCALE')
  const locale = storedValue ? JSON.parse(storedValue) : defaultLocale
  setLocale(locale)
}

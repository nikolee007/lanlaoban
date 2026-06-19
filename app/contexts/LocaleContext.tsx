'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (l: Locale) => void
}
const LocaleContext = createContext<LocaleContextType>({ locale: 'zh', setLocale: () => {} })
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lanlaoban_locale') as Locale | null
      if (saved && (saved === 'zh' || saved === 'en' || saved === 'fr')) {
        setLocale(saved)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('lanlaoban_locale', locale) } catch {}
  }, [locale])

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
}
export function useLocale() { return useContext(LocaleContext) }

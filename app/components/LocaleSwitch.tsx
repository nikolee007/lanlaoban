'use client'
import { useLocale } from '../contexts/LocaleContext'
import type { Locale } from '@/lib/i18n'

const NEXT: Record<Locale, Locale> = { zh: 'en', en: 'fr', fr: 'zh' }
const LABEL: Record<Locale, string> = { zh: 'EN', en: 'FR', fr: '中' }
const ARIA: Record<Locale, string> = { zh: 'Switch to English', en: 'Passer au français', fr: '切换到中文' }

export default function LocaleSwitch() {
  const { locale, setLocale } = useLocale()

  const toggle = () => {
    setLocale(NEXT[locale])
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors shrink-0"
      aria-label={ARIA[locale]}
    >
      {LABEL[locale]}
    </button>
  )
}

'use client'

import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

export default function FooterSection() {
  const { locale } = useLocale()
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-sm text-gray-400">
        {t('home.footer', locale)}
      </div>
    </footer>
  )
}

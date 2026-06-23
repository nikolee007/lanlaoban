'use client'

import Link from 'next/link'
import { FiShoppingCart, FiArrowLeft, FiPackage } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

export function EmptyCartHeader() {
  const { locale } = useLocale()
  return (
    <header className="border-b border-gray-100 bg-white/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Link
          href="/global-supply"
          className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
        >
          <FiArrowLeft className="h-5 w-5" />
          {t('cart.return', locale)}
        </Link>
        <span className="truncate text-sm font-semibold text-gray-900">{t('cart.title', locale)}</span>
      </div>
    </header>
  )
}

export default function EmptyCartView() {
  const { locale } = useLocale()
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <EmptyCartHeader />
      <div className="mx-auto mt-28 max-w-md px-4 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg, #FFF5F0, #F0EBFF)' }}>
          <FiShoppingCart className="h-10 w-10" style={{ color: '#FF6034' }} />
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-800">{t('cart.empty', locale)}</h2>
        <p className="mb-8 text-sm leading-relaxed text-gray-500">{t('cart.emptyDesc', locale)}</p>
        <Link
          href="/global-supply"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
        >
          <FiPackage className="h-4 w-4" />
          {t('cart.browseProducts', locale)}
        </Link>
      </div>
    </main>
  )
}

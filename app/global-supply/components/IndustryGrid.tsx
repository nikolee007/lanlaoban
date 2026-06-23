'use client'

import Link from 'next/link'
import { FiGrid, FiArrowRight } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { ProductCategory } from './types'
import SectionHeader from './SectionHeader'

export default function IndustryGrid({ categories }: { categories: ProductCategory[] }) {
  const { locale } = useLocale()
  if ((categories || []).length === 0) {
    return (
      <section className="mb-8" aria-label={t('supply.industry.title', locale)}>
        <SectionHeader icon={FiGrid} title={t('supply.industry.title', locale)} />
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          {t('supply.industry.empty', locale)}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8" aria-label={t('supply.industry.title', locale)}>
      <SectionHeader icon={FiGrid} title={t('supply.industry.title', locale)} href="/global-supply/categories" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(categories || []).map((cat, idx) => (
          <Link
            key={cat.id}
            href={`/global-supply/search?q=${encodeURIComponent(cat.name)}`}
            className="animate-stagger group rounded-2xl border border-gray-100/80 bg-white p-4 shadow-apple transition-all duration-300 hover:border-brand-100 hover:shadow-apple-md hover:bg-gradient-to-br hover:from-brand-50 hover:to-orange-50 sm:p-5"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <h3 className="mb-1 text-sm font-semibold text-gray-900 group-hover:text-brand-400 sm:text-base">
              {cat.name}
            </h3>
            <p className="text-xs text-gray-400">
              <span className="font-medium text-brand-400">
                {cat.productCount.toLocaleString()}
              </span>{' '}
              {t('supply.industry.productCount', locale)}
            </p>
            <div className="mt-3 flex items-center gap-0.5 text-[10px] text-gray-300 group-hover:text-brand-200">
              <span>{t('supply.industry.browse', locale)}</span>
              <FiArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

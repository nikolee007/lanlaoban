'use client'

import Link from 'next/link'
import { FiStar, FiMapPin, FiAward } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { VerifiedSupplier } from './types'
import SectionHeader from './SectionHeader'

export default function VerifiedSupplierSection({
  suppliers,
}: {
  suppliers: VerifiedSupplier[]
}) {
  const { locale } = useLocale()
  if ((suppliers || []).length === 0) {
    return (
      <section className="mb-8" aria-label={t('supply.supplier.title', locale)}>
        <SectionHeader icon={FiAward} title={t('supply.supplier.title', locale)} />
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          {t('supply.supplier.empty', locale)}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8" aria-label={t('supply.supplier.title', locale)}>
      <SectionHeader
        icon={FiAward}
        title={t('supply.supplier.title', locale)}
        href="/global-supply/suppliers"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(suppliers || []).slice(0, 6).map((s, idx) => (
          <Link
            key={s.id}
            href={`/global-supply/suppliers/${s.id}`}
            className="animate-stagger group rounded-2xl border border-gray-100/80 bg-white p-5 shadow-apple transition-all duration-300 hover:border-amber-100 hover:shadow-apple-md"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="mb-3 flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-400 sm:h-12 sm:w-12 transition-colors group-hover:bg-amber-50 group-hover:text-amber-500">
                {(s.nameZh || '供').charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {s.nameZh || t('supply.supplier.verified', locale)}
                  </h3>
                  {s.isVerified && (
                    <FiAward
                      className="h-4 w-4 shrink-0 text-amber-500"
                      title={t('supply.supplier.verified', locale)}
                    />
                  )}
                </div>
                {s.location && (
                  <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                    <FiMapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{s.location}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <FiStar className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium">
                {s.rating != null ? s.rating.toFixed(1) : '--'}
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {(s.reviewCount ?? 0).toLocaleString()} {t('supply.supplier.reviewCount', locale)}
              </span>
            </div>

            {s.businessTags && (
              <div className="flex flex-wrap gap-1.5">
                {String(s.businessTags)
                  .split(/[,，、]/)
                  .slice(0, 3)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

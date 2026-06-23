'use client'

import Link from 'next/link'
import { FiMapPin, FiAward, FiPackage, FiUsers, FiShield } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { safeJsonParse } from '../constants'
import StarDisplay from './StarDisplay'
import type { SupplierListItem } from '../types'

interface SupplierCardProps {
  supplier: SupplierListItem
  isContacted?: boolean
}

export default function SupplierCard({ supplier, isContacted }: SupplierCardProps) {
  const { locale } = useLocale()
  const tags = safeJsonParse(supplier.businessTags).slice(0, 3)
  const certs = safeJsonParse(supplier.certifications)

  return (
    <Link
      href={`/global-supply/suppliers/${supplier.id}`}
      className={`card group p-5 transition-all hover:shadow-apple-lg hover:-translate-y-0.5 ${
        isContacted ? '!border-violet-200 hover:!border-violet-300' : ''
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-500">
          {(supplier.nameZh || '供').charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="truncate text-sm font-semibold text-gray-900">{supplier.nameZh}</h3>
            {supplier.isVerified && (
              <FiAward className="h-4 w-4 shrink-0 text-amber-500" title={t('supply.supplier.verified', locale)} />
            )}
            {supplier.yearEstablished > 0 && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 shrink-0 whitespace-nowrap">
                已合作 {new Date().getFullYear() - supplier.yearEstablished} 年
              </span>
            )}
            {isContacted && (
              <span className="inline-flex items-center rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 shrink-0 whitespace-nowrap">
                已联系
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-400">{supplier.nameEn}</p>
        </div>
      </div>
      <div className="mb-2 flex items-center gap-1 text-xs text-gray-400">
        <FiMapPin className="h-3 w-3 shrink-0" />{supplier.location}
      </div>
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <StarDisplay rating={supplier.rating} />
        <span className="font-medium text-gray-700">{supplier.rating.toFixed(1)}</span>
        <span className="text-gray-300">|</span>
        <span>{supplier.reviewCount} {t('suppliers.reviewCount', locale).replace('{count}', String(supplier.reviewCount))}</span>
      </div>
      <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><FiPackage className="h-3 w-3" />{supplier.productCount} {t('common.unitPieces', locale)}</span>
        <span className="flex items-center gap-1"><FiUsers className="h-3 w-3" />{supplier.employeeCount} {t('common.unitPeople', locale)}</span>
      </div>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((tag: string) => (
            <span key={tag} className="inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">{tag}</span>
          ))}
        </div>
      )}
      {certs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {certs.slice(0, 4).map((cert: string) => (
            <span key={cert} className="inline-flex items-center gap-0.5 rounded border border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              <FiShield className="h-2.5 w-2.5" />{cert}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

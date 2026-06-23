'use client'

import Link from 'next/link'
import { FiTrash2, FiMessageSquare, FiMapPin, FiShield } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import RatingDisplay from './RatingDisplay'
import type { SupplierRecord } from '../types'

interface SupplierListItemProps {
  item: SupplierRecord
  isUnfavoriting: boolean
  onUnfavorite: (item: SupplierRecord) => void
}

export default function SupplierListItem({ item, isUnfavoriting, onUnfavorite }: SupplierListItemProps) {
  const { locale } = useLocale()

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div className="shrink-0 w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-bold text-lg">
          {(item.nameZh || item.nameEn || '?').charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name || t('common.noData', locale)}</h3>
            {item.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">
                <FiShield className="w-3 h-3" />
                {t('supply.supplier.verified', locale)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            {item.location && (
              <span className="inline-flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                {item.location}
              </span>
            )}
            <RatingDisplay rating={item.rating} />
          </div>
          {/* Business tags */}
          {item.businessTags.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {item.businessTags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <button
            onClick={() => onUnfavorite(item)}
            disabled={isUnfavoriting}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            {isUnfavoriting ? '取消中...' : '取消收藏'}
          </button>
          <Link
            href={`/global-supply/${item.targetId}`}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-white text-brand-400 border border-brand-400 hover:bg-brand-50 transition-all whitespace-nowrap"
          >
            <FiMessageSquare className="w-3.5 h-3.5" />
            联系供应商
          </Link>
        </div>
      </div>
    </div>
  )
}

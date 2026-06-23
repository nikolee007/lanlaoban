'use client'

import Link from 'next/link'
import { FiTrash2, FiSearch, FiClock } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { safePriceDisplay, timeAgo } from '../utils'
import type { ProductRecord } from '../types'

interface ProductListItemProps {
  item: ProductRecord
  isUnfavoriting: boolean
  onUnfavorite: (item: ProductRecord) => void
}

export default function ProductListItem({ item, isUnfavoriting, onUnfavorite }: ProductListItemProps) {
  const { locale } = useLocale()
  const priceText = safePriceDisplay(item.priceMin, item.priceMax)

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          <img
            src={productPlaceholderSVG(item.name, 160, 160, item.targetId)}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name || t('common.noData', locale)}</h3>
          <p className="text-sm font-medium text-brand-500 mt-0.5">{priceText}</p>
          <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-1">
            <FiClock className="w-3 h-3" />
            {t('common.save', locale)}于 {timeAgo(item.savedAt)}
          </p>
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
            href={`/global-supply/search?q=${encodeURIComponent(item.name)}`}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-white text-brand-400 border border-brand-400 hover:bg-brand-50 transition-all whitespace-nowrap"
          >
            <FiSearch className="w-3.5 h-3.5" />
            搜索同类
          </Link>
        </div>
      </div>
    </div>
  )
}

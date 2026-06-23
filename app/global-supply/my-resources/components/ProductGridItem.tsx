'use client'

import Link from 'next/link'
import { FiTrash2, FiSearch, FiClock } from 'react-icons/fi'
import { productPlaceholderSVG, getCategoryInfo } from '@/lib/product-placeholder'
import { safePriceDisplay, timeAgo } from '../utils'
import type { ProductRecord } from '../types'

interface ProductGridItemProps {
  item: ProductRecord
  isUnfavoriting: boolean
  onUnfavorite: (item: ProductRecord) => void
}

export default function ProductGridItem({ item, isUnfavoriting, onUnfavorite }: ProductGridItemProps) {
  const priceText = safePriceDisplay(item.priceMin, item.priceMax)
  const categoryInfo = getCategoryInfo(item.name)

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        <img
          src={productPlaceholderSVG(item.name, 300, 300, item.targetId)}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm">
            {categoryInfo.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm truncate leading-snug">{item.name || '未命名商品'}</h3>
        <p className="text-sm font-bold text-brand-500 mt-1">{priceText}</p>
        <p className="text-[10px] text-gray-400 mt-1.5">
          <FiClock className="w-3 h-3 inline mr-0.5" />
          {timeAgo(item.savedAt)}
        </p>
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
          <button
            onClick={() => onUnfavorite(item)}
            disabled={isUnfavoriting}
            className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="w-3 h-3" />
            {isUnfavoriting ? '取消中' : '取消收藏'}
          </button>
          <Link
            href={`/global-supply/search?q=${encodeURIComponent(item.name)}`}
            className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg text-brand-400 hover:bg-brand-50 transition-colors"
          >
            <FiSearch className="w-3 h-3" />
            搜索同类
          </Link>
        </div>
      </div>
    </div>
  )
}

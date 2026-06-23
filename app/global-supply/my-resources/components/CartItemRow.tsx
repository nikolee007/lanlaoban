'use client'

import { FiClock } from 'react-icons/fi'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { safePriceDisplay, timeAgo } from '../utils'
import type { CartItemRecord } from '../types'

interface CartItemRowProps {
  item: CartItemRecord
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const priceText = safePriceDisplay(item.priceMin, item.priceMax)

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          <img
            src={productPlaceholderSVG(item.productName, 128, 128, item.id)}
            alt={item.productName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">{item.productName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-medium text-brand-500">{priceText}</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">采购量: <strong className="text-gray-700">{item.quantity.toLocaleString()}</strong> 件</span>
          </div>
          <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-1">
            <FiClock className="w-3 h-3" />
            添加于 {timeAgo(item.addedAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

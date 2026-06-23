'use client'

import { FiClock, FiUsers, FiChevronRight } from 'react-icons/fi'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { safePriceDisplay, timeAgo } from '../utils'
import { INQUIRY_STATUS_META } from '../constants'
import type { InquiryProductRecord } from '../types'

interface InquiryProductListItemProps {
  item: InquiryProductRecord
}

export default function InquiryProductListItem({ item }: InquiryProductListItemProps) {
  const statusMeta = INQUIRY_STATUS_META[item.status] || INQUIRY_STATUS_META.pending
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
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{item.productName}</h3>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="text-sm font-medium text-brand-500 mt-0.5">{priceText}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <FiUsers className="w-3 h-3" />
              {item.supplierName}
            </span>
            <span className="inline-flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              询价于 {timeAgo(item.inquiryDate)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <FiChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
      </div>
    </div>
  )
}

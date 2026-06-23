'use client'

import { FiX, FiStar, FiPackage } from 'react-icons/fi'
import type { CompareItem } from '@/app/contexts/CompareContext'

interface CompareItemCardProps {
  item: CompareItem
  onRemove: (item: CompareItem) => void
}

export default function CompareItemCard({ item, onRemove }: CompareItemCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Thumbnail */}
        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <FiPackage className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
          <p className="text-sm font-medium text-brand-500 mt-0.5">{item.price}</p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 flex-wrap">
            <span>MOQ: {item.moq}</span>
            {item.location && (
              <>
                <span className="text-gray-300">|</span>
                <span>{item.location}</span>
              </>
            )}
            {item.rating > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="inline-flex items-center gap-0.5">
                  <FiStar className="w-3 h-3 text-amber-400 fill-current" />
                  {item.rating}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item)}
          className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="移出对比"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

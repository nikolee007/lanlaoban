'use client'

import { FiSend } from 'react-icons/fi'

interface CartTotalsProps {
  selectedCount: number
  selectedIds: number[]
  subtotal: number
  locale: string
}

export default function CartTotals({ selectedCount, selectedIds, subtotal, locale }: CartTotalsProps) {
  const tSelected = locale === 'en'
    ? `Selected: ${selectedCount}`
    : `已选 ${selectedCount} 件`
  const tEstimated = locale === 'en'
    ? `Est. subtotal: ¥${subtotal.toLocaleString()}`
    : `预估小计: ¥${subtotal.toLocaleString()}`

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          {tSelected}
          {selectedCount > 0 && (
            <span className="ml-2 text-xs text-gray-400">{tEstimated}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={selectedCount === 0}
            onClick={() => {
              if (selectedCount > 0) {
                window.location.href = `/global-supply/checkout?selected=${selectedIds.join(',')}`
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="生成采购单"
          >
            <FiSend className="h-4 w-4" />
            生成采购单
          </button>
        </div>
      </div>
    </footer>
  )
}

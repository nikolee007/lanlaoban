'use client'

import Link from 'next/link'
import { FiTrash2, FiMinus, FiPlus, FiRefreshCw, FiCheckCircle } from 'react-icons/fi'
import { productPlaceholderSVG } from '@/lib/product-placeholder'

// ── Types ──

interface CartProduct {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  currency: string
  images: string | null
  rating: number | null
  reviewCount: number | null
  supplier: {
    id: number
    nameZh: string
    nameEn: string
    location: string
    isVerified: boolean
  } | null
}

export interface CartItemData {
  id: number
  userId: number
  productId: number
  quantity: number
  notes: string | null
  createdAt: string
  updatedAt: string
  product: CartProduct
}

// ── Helpers ──

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function formatPrice(priceMin: number | null, priceMax: number | null): string {
  if (priceMin == null && priceMax == null) return '--'
  const min = priceMin ?? 0
  const max = priceMax ?? 0
  return `¥${min} - ¥${max}`
}

// ── Props ──

interface CartItemCardProps {
  item: CartItemData
  isSelected: boolean
  isUpdating: boolean
  onToggleSelect: (id: number) => void
  onUpdateQuantity: (id: number, newQty: number) => void
  onDelete: (id: number) => void
  locale: string
}

export default function CartItemCard({
  item,
  isSelected,
  isUpdating,
  onToggleSelect,
  onUpdateQuantity,
  onDelete,
  locale,
}: CartItemCardProps) {
  const images = safeJsonParse<string[]>(item.product.images, [])
  const imageSrc = images.length > 0
    ? images[0]
    : productPlaceholderSVG(item.product.name, 200, 200, item.product.id)

  // Simple i18n helpers
  const tNote = locale === 'en' ? 'Note: {note}' : '备注: {note}'
  const tSubtotal = locale === 'en' ? 'Subtotal: ¥{amount}' : '小计: ¥{amount}'
  const tDelete = locale === 'en' ? 'Delete' : '删除'

  return (
    <div
      className={`card relative p-4 transition-all ${
        isSelected ? 'ring-2 ring-brand-400' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Checkbox */}
        <div className="flex items-start pt-5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="h-4 w-4 rounded border-gray-300 text-brand-400 focus:ring-brand-400"
          />
        </div>

        {/* Image */}
        <Link
          href={`/global-supply/${item.productId}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        </Link>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="min-w-0">
            <Link
              href={`/global-supply/${item.productId}`}
              className="line-clamp-1 text-sm font-semibold text-gray-800 transition-colors hover:text-brand-500"
            >
              {item.product.name}
            </Link>
            {item.product.supplier && (
              <p className="mt-0.5 truncate text-xs text-gray-400">
                {item.product.supplier.nameZh || item.product.supplier.nameEn}
                {item.product.supplier.isVerified && (
                  <FiCheckCircle className="ml-1 inline h-3 w-3 text-green-500" />
                )}
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            {/* Price */}
            <span className="text-sm font-bold text-brand-600">
              {formatPrice(item.product.priceMin, item.product.priceMax)}
            </span>

            {/* Quantity Selector */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="减少数量"
              >
                <FiMinus className="h-3 w-3" />
              </button>
              <span className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg bg-gray-50 text-sm font-semibold text-gray-700">
                {isUpdating ? (
                  <FiRefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                disabled={isUpdating}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="增加数量"
              >
                <FiPlus className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {item.notes ? tNote.replace('{note}', item.notes) : ''}
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {tSubtotal.replace('{amount}', ((item.product.priceMin ?? 0) * item.quantity).toLocaleString())}
            </span>
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(item.id)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label={tDelete}
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

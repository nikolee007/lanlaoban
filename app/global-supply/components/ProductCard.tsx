'use client'

import Link from 'next/link'
import { FiTrendingUp, FiMapPin } from 'react-icons/fi'
import { productPlaceholderSVG, getCategoryInfo } from '@/lib/product-placeholder'

export interface HotProductData {
  id: number
  name: string
  region: string
  growthRate: string
  hotTag: string | null
  sales: string
}

const RANK_STYLES = [
  { gradient: 'linear-gradient(135deg,#FF6034,#FF3D14)' },
  { gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  { gradient: 'linear-gradient(135deg,#6B7280,#4B5563)' },
]

export default function ProductCard({ product, index }: { product: HotProductData; index: number }) {
  const catInfo = getCategoryInfo(product.name)
  const isTop3 = index < 3

  return (
    <Link
      href={`/global-supply/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-apple transition-all duration-300 hover:shadow-apple-md hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>
        <img
          src={productPlaceholderSVG(product.name, 300, 300, product.id)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Rank badge (gold/silver/bronze) */}
        {isTop3 && (
          <span
            className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ring-2 ring-white/60"
            style={{ background: RANK_STYLES[index].gradient }}
          >
            {index + 1}
          </span>
        )}

        {/* Hot tag */}
        {product.hotTag && (
          <span className="absolute right-2 top-2 z-10 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-red-500 shadow-sm backdrop-blur-sm">
            {product.hotTag}
          </span>
        )}

        {/* Category badge */}
        <span
          className="absolute left-2 bottom-8 z-10 rounded px-1.5 py-0.5 text-[9px] font-medium shadow-sm"
          style={{ backgroundColor: catInfo.bg, color: catInfo.color }}
        >
          {catInfo.category}
        </span>

        {/* Gradient overlay + growth rate */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent p-2 pt-6">
          <span className="text-xs font-bold text-white drop-shadow-sm">{product.growthRate}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="line-clamp-1 text-xs font-medium text-gray-900">{product.name}</h3>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <FiMapPin className="h-3 w-3" />
            {product.region}
          </div>
        </div>
        {product.sales && (
          <div className="mt-1 flex items-center gap-1 text-[9px]" style={{ color: '#FF6034' }}>
            <FiTrendingUp className="h-2.5 w-2.5" />
            {product.sales}
          </div>
        )}
      </div>
    </Link>
  )
}

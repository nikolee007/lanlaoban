'use client'

import Link from 'next/link'
import { FiStar } from 'react-icons/fi'
import OptimizedImage from '../../../../components/OptimizedImage'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import { safeJsonParse } from '../helpers'
import type { SupplierProduct } from '../types'

export default function SupplierProductCard({ product }: { product: SupplierProduct }) {
  const images = safeJsonParse<string[]>(product.images, [])
  const imageSrc = images[0] || productPlaceholderSVG(product.name || '商品', 400, 300, product.id)

  return (
    <Link href={`/global-supply/${product.id}`}
      className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:border-brand-100 hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden bg-gray-50">
        <OptimizedImage src={imageSrc} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="space-y-1.5 p-3.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 group-hover:text-brand-500">{product.name}</h3>
        {product.priceMin != null && product.priceMax != null && (
          <p className="text-sm font-bold text-brand-500">
            ¥{product.priceMin}
            {product.priceMax !== product.priceMin && <span className="text-xs font-normal text-gray-400"> - ¥{product.priceMax}</span>}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {product.rating != null && <span className="flex items-center gap-0.5"><FiStar className="h-3 w-3 text-amber-400" />{product.rating.toFixed(1)}</span>}
          {product.moq != null && <span>MOQ: {product.moq}件</span>}
        </div>
        <div className="flex flex-wrap gap-1">
          {product.supportsDropShipping && <span className="inline-block rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700">一件代发</span>}
          {product.supportsOEM && <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">OEM</span>}
        </div>
      </div>
    </Link>
  )
}

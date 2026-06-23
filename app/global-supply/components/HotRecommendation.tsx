'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiStar, FiTrendingUp } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { productPlaceholderSVG } from '@/lib/product-placeholder'
import type { ProductItem } from './types'
import SectionHeader from './SectionHeader'

function extractRegion(location: string | null): string {
  if (!location) return '海外'
  if (/广东|深圳|广州/.test(location)) return '华南'
  if (/浙江|义乌|江苏|福建/.test(location)) return '华东'
  if (/山东|北京|天津|河北/.test(location)) return '华北'
  if (/四川|重庆/.test(location)) return '西南'
  if (/湖北|湖南/.test(location)) return '华中'
  if (/辽宁|吉林|黑龙江/.test(location)) return '东北'
  return location
}

export default function HotRecommendation({ products }: { products: ProductItem[] }) {
  const { locale } = useLocale()
  if ((products || []).length === 0) return null

  return (
    <section className="mb-8" aria-label={t('supply.hot.title', locale)}>
      <SectionHeader icon={FiTrendingUp} title={t('supply.hot.title', locale)} subtitle={t('supply.hot.subtitle', locale)} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(products || []).slice(0, 8).map((p, idx) => (
          <Link
            key={p.id}
            href={`/global-supply/${p.id}/${p.id}`}
            className="animate-stagger group overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-apple transition-all duration-300 hover:border-brand-100 hover:shadow-apple-md"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Product image */}
            <div className="aspect-square w-full overflow-hidden bg-gray-50">
              <Image
                src={productPlaceholderSVG(p.name, 300, 300, p.id)}
                alt={p.name}
                width={300}
                height={300}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Product info */}
            <div className="space-y-1.5 p-3">
              <h3 className="truncate text-sm font-medium text-gray-900 line-clamp-1">
                {p.name || t('supply.product.name', locale)}
              </h3>

              {/* Price range */}
              {p.priceMin != null && p.priceMax != null && (
                <p className="text-sm font-semibold" style={{ color: '#FF6034' }}>
                  ¥{p.priceMin}
                  {p.priceMax !== p.priceMin && (
                    <span className="text-xs text-gray-400 font-normal"> - ¥{p.priceMax}</span>
                  )}
                </p>
              )}

              {/* Location + Rating */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                {p.location ? (
                  <span className="truncate">{extractRegion(p.location)}</span>
                ) : (
                  <span />
                )}
                {p.rating != null && (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <FiStar className="h-3 w-3 text-amber-400" />
                    <span className="font-medium text-gray-600">{p.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

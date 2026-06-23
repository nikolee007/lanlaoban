import Link from 'next/link'
import { FiPackage, FiRefreshCw, FiStar } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import OptimizedImage from '../../../components/OptimizedImage'
import type { UIRelatedProduct } from '../types'

interface RelatedProductsGridProps {
  items: UIRelatedProduct[]
  loading: boolean
}

export default function RelatedProductsGrid({ items, loading }: RelatedProductsGridProps) {
  const { locale } = useLocale()

  return (
    <section className="mt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
        <FiPackage className="h-5 w-5 text-brand-400" />
        {t('detail.related', locale)}
        {loading && <FiRefreshCw className="h-4 w-4 animate-spin text-gray-400" />}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((rel) => (
          <Link key={rel.id} href={`/global-supply/${rel.id}`}
            className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
              <OptimizedImage src={rel.image} alt={rel.name} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-3.5">
              <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-500">{rel.name}</h3>
              {rel.supplier && <p className="mb-2 truncate text-xs text-gray-400">{rel.supplier}</p>}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-600">{rel.price}</span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />{rel.rating}
                  {rel.reviews > 0 && <><span className="text-gray-300">|</span>{rel.reviews.toLocaleString()}</>}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

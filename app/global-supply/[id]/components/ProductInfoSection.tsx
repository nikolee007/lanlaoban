import { FiBarChart2, FiCheckCircle } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { UIProduct } from '../types'

interface ProductInfoSectionProps {
  product: UIProduct
}

export default function ProductInfoSection({ product }: ProductInfoSectionProps) {
  const { locale } = useLocale()

  return (
    <section className="card mb-4">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <FiBarChart2 className="h-5 w-5 text-brand-500" />
        {t('detail.productInfo', locale)}
      </h2>
      <dl className="divide-y divide-gray-50">
        <div className="-mx-4 flex flex-col gap-0.5 bg-brand-50/40 px-4 py-3 sm:-mx-6 sm:flex-row sm:items-start sm:px-6">
          <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.priceRange', locale)}</dt>
          <dd className="text-lg font-bold text-brand-600">
            <span className="inline-flex items-baseline gap-0.5">
              <span>{product.priceRange}</span>
              <span className="text-xs text-gray-400">CNY / {t('common.unitPieces', locale)}</span>
            </span>
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
          <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.moq', locale)}</dt>
          <dd className="text-sm text-gray-900">{product.moq}</dd>
        </div>
        <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
          <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.dropshipping', locale)}</dt>
          <dd className="text-sm text-gray-900">
            {product.dropshipping ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <FiCheckCircle className="h-3.5 w-3.5" />{t('detail.supported', locale)}
              </span>
            ) : t('detail.notSupported', locale)}
          </dd>
        </div>
        {product.oem && (
          <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.oem', locale)}</dt>
            <dd className="text-sm text-gray-900">
              <span className="inline-flex items-center gap-1 text-green-600">
                <FiCheckCircle className="h-3.5 w-3.5" />{t('detail.supported', locale)}
              </span>
            </dd>
          </div>
        )}
        {Object.entries(product.specs || {}).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
            <dt className="min-w-[7rem] text-sm text-gray-500">{k}</dt>
            <dd className="text-sm text-gray-900">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

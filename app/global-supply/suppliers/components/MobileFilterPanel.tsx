'use client'

import { FiX } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { REGION_OPTIONS, CERTIFICATION_OPTIONS, RATING_OPTIONS } from '../constants'

interface MobileFilterPanelProps {
  filters: Record<string, string>
  onFilterChange: (key: string, val: string) => void
  onClose: () => void
}

export default function MobileFilterPanel({ filters, onFilterChange, onClose }: MobileFilterPanelProps) {
  const { locale } = useLocale()

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white px-5 py-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">{t('search.filters', locale)}</span>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { key: 'region', label: t('search.filter.region', locale), options: REGION_OPTIONS },
            { key: 'cert', label: t('search.filter.cert', locale), options: CERTIFICATION_OPTIONS },
            { key: 'rating', label: t('search.filter.rating', locale), options: RATING_OPTIONS },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">{label}</label>
              <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => onFilterChange(key, o.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      filters[key as keyof typeof filters] === o.value
                        ? 'border-brand-300 bg-brand-50 font-medium text-brand-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

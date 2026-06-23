'use client'

import { FiTruck, FiPackage, FiGrid } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { HomeStats } from './types'

export default function StatsBar({ stats }: { stats: HomeStats }) {
  const { locale } = useLocale()
  const items: {
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { label: t('supply.stats.suppliers', locale), value: stats.suppliers, icon: FiTruck },
    { label: t('supply.stats.products', locale), value: stats.products, icon: FiPackage },
    { label: t('supply.stats.categories', locale), value: stats.categories, icon: FiGrid },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
      {(items || []).map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100/80 bg-white p-4 sm:p-5 text-center shadow-apple transition-all duration-300 hover:shadow-apple-md"
          >
            <div className="mb-2 flex justify-center">
              <Icon className="h-5 w-5 text-brand-400" />
            </div>
            <div className="mb-0.5 text-2xl font-bold text-brand-500 sm:text-3xl">
              {item.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 sm:text-sm">{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { t } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n'

export const REGION_KEYS = [
  { key: '全部', i18n: 'hot.region.all' },
  { key: '美国', i18n: 'hot.region.usa' },
  { key: '欧洲', i18n: 'hot.region.europe' },
  { key: '东南亚', i18n: 'hot.region.seAsia' },
  { key: '中东', i18n: 'hot.region.middleEast' },
  { key: '拉美', i18n: 'hot.region.latam' },
] as const

interface RegionSelectorProps {
  activeRegion: string
  onRegionChange: (region: string) => void
  locale: Locale
}

export default function RegionSelector({ activeRegion, onRegionChange, locale }: RegionSelectorProps) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto flex-nowrap pb-1 sm:flex-wrap sm:overflow-visible">
      {REGION_KEYS.map((r) => (
        <button
          key={r.key}
          onClick={() => onRegionChange(r.key)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
            activeRegion === r.key
              ? 'text-white shadow-md'
              : 'border border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-400 shadow-sm'
          }`}
          style={
            activeRegion === r.key
              ? { background: 'linear-gradient(135deg, #FF6034, #FF8A5C)' }
              : undefined
          }
        >
          {t(r.i18n, locale)}
        </button>
      ))}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { FiSearch, FiChevronRight } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

const HOT_SEARCH_TAGS: string[] = [
  '蓝牙耳机',
  '陶瓷餐具',
  '充电宝',
  '工厂代工',
  '跨境物流',
  '现货采购',
  '一件代发',
  '品牌代工',
]

export default function HeroSearchSection({
  searchQuery,
  onSearchChange,
  onSearch,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
  onSearch: () => void
}) {
  const { locale } = useLocale()
  return (
    <section
      className="relative mb-6 overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-8 sm:py-14"
      style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)' }}
      aria-label={t('supply.hero.title', locale)}
    >
      {/* Decorative circles */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10"
        style={{ backgroundColor: '#FF6034' }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-10"
        style={{ backgroundColor: '#FF6034' }}
      />

      <h1 className="relative mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t('supply.hero.title', locale)}
      </h1>
      <p className="relative mb-6 text-sm text-gray-500 sm:text-base">
        {t('supply.hero.subtitle', locale)}
      </p>

      {/* Search bar */}
      <div className="relative mx-auto max-w-xl">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm transition-all focus-within:shadow-[0_0_0_3px_rgba(255,96,52,0.15)] focus-within:border-brand-200">
          <FiSearch className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder={t('supply.hero.searchPlaceholder', locale)}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
          />
          <button
            onClick={onSearch}
            className="shrink-0 rounded-xl px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FF6034' }}
          >
            {t('supply.hero.searchButton', locale)}
          </button>
        </div>
      </div>

      {/* Hot search tags */}
      <div className="relative mt-4 flex flex-wrap justify-center gap-2">
        {(HOT_SEARCH_TAGS || []).map((tag) => (
          <Link
            key={tag}
            href={`/global-supply/search?q=${encodeURIComponent(tag)}`}
            className="inline-block rounded-full border border-brand-100 bg-white/60 px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-brand-300 hover:bg-white hover:text-brand-400"
          >
            {tag}
          </Link>
        ))}
      </div>
    </section>
  )
}

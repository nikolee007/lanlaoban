'use client'

import { FiSearch, FiX, FiClock, FiGrid, FiList } from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import type { SortKey, ViewMode } from '../types'
import { SORT_OPTIONS } from '../constants'

interface SearchToolbarProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  activeTab: 'products' | 'suppliers'
  sortKey: SortKey
  setSortKey: (k: SortKey) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  onClearSearch: () => void
}

export default function SearchToolbar({
  searchQuery,
  setSearchQuery,
  activeTab,
  sortKey,
  setSortKey,
  viewMode,
  setViewMode,
  onClearSearch,
}: SearchToolbarProps) {
  const { locale } = useLocale()

  return (
    <div className="flex items-center gap-3 mb-5 flex-col sm:flex-row">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={activeTab === 'products' ? t('search.supply', locale) : t('suppliers.searchPlaceholder', locale)}
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-400/10 transition-all"
        />
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sort + View toggle (products only) */}
      {activeTab === 'products' && (
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {/* Sort dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="w-full sm:w-auto appearance-none bg-white border border-gray-200 text-gray-600 text-sm rounded-xl px-3 py-2.5 pr-8 focus:outline-none focus:border-brand-300 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
            <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-brand-50 text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="列表视图"
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-brand-50 text-brand-500' : 'text-gray-400 hover:text-gray-600'}`}
              aria-label="网格视图"
            >
              <FiGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

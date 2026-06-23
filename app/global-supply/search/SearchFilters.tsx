'use client'

import { FiFilter, FiX, FiCheck, FiPackage } from 'react-icons/fi'
import FilterDropdown from './FilterDropdown'
import { FILTER_GROUPS, SORT_OPTIONS } from '../search-utils'

export interface FiltersState {
  category: string
  region: string
  minOrder: string
  cert: string
  rating: string
  priceMin: string
  priceMax: string
  dropship: string
}

export const EMPTY_FILTERS: FiltersState = {
  category: '', region: '', minOrder: '', cert: '', rating: '', priceMin: '', priceMax: '', dropship: '',
}

interface SearchFiltersProps {
  filters: FiltersState
  sort: string
  activeFilterCount: number
  showMobileFilters: boolean
  updateFilter: (key: string, val: string) => void
  setSort: (v: string) => void
  setFilters: (f: FiltersState) => void
  setShowMobileFilters: (v: boolean) => void
}

const CUSTOM_FILTER_LABELS: Record<string, (val: string) => string> = {
  priceMin: (v) => `最低价 ¥${v}`,
  priceMax: (v) => `最高价 ¥${v}`,
  dropship: () => '一件代发',
}

export function ActiveFilterChips({
  filters,
  updateFilter,
  setFilters,
  activeFilterCount,
}: {
  filters: FiltersState
  updateFilter: (key: string, val: string) => void
  setFilters: (f: FiltersState) => void
  activeFilterCount: number
}) {
  if (activeFilterCount === 0) return null
  return (
    <div className="flex items-center gap-1.5 mb-4 flex-wrap">
      {Object.entries(filters)
        .filter(([, v]) => v)
        .map(([key, val]) => {
          const group = FILTER_GROUPS.find((g) => g.key === key)
          const option = group?.options.find((o) => o.value === val)
          const customLabel = CUSTOM_FILTER_LABELS[key]
          const displayLabel = customLabel ? customLabel(val) : (option?.label || val)
          return (
            <span
              key={key}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100"
            >
              {displayLabel}
              <button onClick={() => updateFilter(key, '')}>
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )
        })}
      <button
        onClick={() => setFilters(EMPTY_FILTERS)}
        className="text-xs text-gray-400 hover:text-gray-600 ml-1"
      >
        清除全部
      </button>
    </div>
  )
}

export default function SearchFilters({
  filters,
  sort,
  activeFilterCount,
  showMobileFilters,
  updateFilter,
  setSort,
  setFilters,
  setShowMobileFilters,
}: SearchFiltersProps) {
  return (
    <>
      {/* Filters bar - desktop */}
      <div className="hidden lg:flex items-center gap-2 mb-4 overflow-x-auto pb-1" aria-label="筛选条件">
        {(FILTER_GROUPS || []).map((g) => (
          <FilterDropdown
            key={g.key}
            label={g.label}
            options={g.options}
            value={filters[g.key as keyof FiltersState]}
            onChange={(v) => updateFilter(g.key, v)}
          />
        ))}

        {/* Price range filter */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            placeholder="最低价"
            value={filters.priceMin}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
            className="w-20 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:border-brand-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-300">-</span>
          <input
            type="number"
            min="0"
            placeholder="最高价"
            value={filters.priceMax}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            className="w-20 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:border-brand-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Dropship toggle */}
        <button
          onClick={() => updateFilter('dropship', filters.dropship === 'true' ? '' : 'true')}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap ${
            filters.dropship === 'true'
              ? 'border-brand-300 bg-brand-50 text-brand-600 font-medium'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <FiPackage className="w-3.5 h-3.5" />
          一件代发
          {filters.dropship === 'true' && <FiCheck className="w-3.5 h-3.5" />}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">排序:</span>
          <FilterDropdown
            label="综合推荐"
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>

      {/* Filters bar - mobile */}
      <div className="flex lg:hidden items-center gap-2 mb-3">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-brand-200 hover:text-brand-600 transition-colors min-h-[44px]"
        >
          <FiFilter className="w-4 h-4" />
          <span>筛选</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-400 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="ml-auto">
          <FilterDropdown
            label="排序"
            options={SORT_OPTIONS}
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>

      {/* Mobile expanded filters */}
      {showMobileFilters && (
        <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">更多筛选</span>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {(FILTER_GROUPS || []).slice(0).map((g) => (
              <div key={g.key}>
                <label className="text-xs text-gray-500 mb-1 block">{g.label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {(g.options || []).map((o) => (
                    <button
                      key={o.value}
                      onClick={() => updateFilter(g.key, o.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        filters[g.key as keyof FiltersState] === o.value
                          ? 'border-brand-300 bg-brand-50 text-brand-600 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Price range - mobile */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">价格区间</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="最低价"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-brand-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-300">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="最高价"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter('priceMax', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-brand-300 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Dropship toggle - mobile */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">一件代发</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => updateFilter('dropship', filters.dropship === 'true' ? '' : 'true')}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    filters.dropship === 'true'
                      ? 'border-brand-300 bg-brand-50 text-brand-600 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  仅看支持一件代发
                </button>
                {filters.dropship === 'true' && (
                  <button
                    onClick={() => updateFilter('dropship', '')}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-3 text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              清除所有筛选
            </button>
          )}
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { FiChevronDown, FiCheck, FiX } from 'react-icons/fi'

// ── Types ──

export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
}

// ── Filter Definitions ──

export const FILTER_GROUPS: FilterGroup[] = [
  {
    key: 'region',
    label: '地区',
    options: [
      { label: '全部地区', value: '' },
      { label: '深圳', value: '深圳' },
      { label: '广州', value: '广州' },
      { label: '东莞', value: '东莞' },
      { label: '义乌', value: '义乌' },
      { label: '汕头', value: '汕头' },
      { label: '佛山', value: '佛山' },
    ],
  },
  {
    key: 'rating',
    label: '评分',
    options: [
      { label: '不限', value: '' },
      { label: '4.5星+', value: '4.5' },
      { label: '4.0星+', value: '4.0' },
      { label: '3.5星+', value: '3.5' },
    ],
  },
]

// ── Filter Dropdown ──

function FilterDropdown({
  label, options, value, onChange,
}: {
  label: string
  options: FilterOption[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap ${
          value
            ? 'border-brand-300 bg-brand-50 text-brand-600 font-medium'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        {value && <FiCheck className="w-3.5 h-3.5" />}
        {current?.label || label}
        <FiChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[140px] py-1">
          {options.map(o => (
            <button
              key={o.value}
              onMouseDown={() => { onChange(o.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                value === o.value ? 'text-brand-600 bg-brand-50 font-medium' : 'text-gray-700'
              }`}
            >
              {o.value && value === o.value && <FiCheck className="w-3 h-3 inline mr-1.5" />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FilterBar Props ──

interface FilterBarProps {
  filters: Record<string, string>
  sort: string
  activeFilterCount: number
  onFilterChange: (key: string, val: string) => void
  onSortChange: (sort: string) => void
  onClearAll: () => void
}

export default function FilterBar({
  filters,
  sort,
  activeFilterCount,
  onFilterChange,
  onSortChange,
  onClearAll,
}: FilterBarProps) {
  return (
    <>
      {/* Filters bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {FILTER_GROUPS.map(g => (
          <FilterDropdown
            key={g.key}
            label={g.label}
            options={g.options}
            value={filters[g.key]}
            onChange={v => onFilterChange(g.key, v)}
          />
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">排序:</span>
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-brand-300"
          >
            <option value="default">综合推荐</option>
            <option value="sales">月销量</option>
            <option value="price-asc">价格低到高</option>
            <option value="price-desc">价格高到低</option>
            <option value="rating">评分最高</option>
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => {
            const group = FILTER_GROUPS.find(g => g.key === key)
            const option = group?.options.find(o => o.value === val)
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100"
              >
                {option?.label || val}
                <button onClick={() => onFilterChange(key, '')}>
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )
          })}
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-gray-600 ml-1"
          >
            清除全部
          </button>
        </div>
      )}
    </>
  )
}

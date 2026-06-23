'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiSearch, FiChevronLeft, FiChevronRight,
  FiFilter, FiX, FiPackage, FiRefreshCw,
  FiAlertCircle, FiGlobe,
} from 'react-icons/fi'
import { REGION_OPTIONS, CERTIFICATION_OPTIONS, RATING_OPTIONS, SORT_OPTIONS, ITEMS_PER_PAGE } from './constants'
import type { SupplierListItem, SupplierListResponse } from './types'
import FilterDropdown from './components/FilterDropdown'
import MobileFilterPanel from './components/MobileFilterPanel'
import SupplierCard from './components/SupplierCard'
import SupplierListSkeleton, { SkeletonBlock } from './components/SupplierListSkeleton'

export default function SupplierListPage() {
  const { locale } = useLocale()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({ region: '', cert: '', rating: '' })
  const [sort, setSort] = useState('default')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [contactedSupplierIds, setContactedSupplierIds] = useState<Set<number>>(new Set())

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lanlaoban_contacted_suppliers')
      if (raw) setContactedSupplierIds(new Set(JSON.parse(raw)))
    } catch { /* silently ignore */ }
  }, [])

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(currentPage))
      params.set('pageSize', String(ITEMS_PER_PAGE))
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      if (filters.region) params.set('region', filters.region)
      if (filters.cert) params.set('certification', filters.cert)
      if (filters.rating) params.set('minRating', filters.rating)
      if (sort === 'rating') params.set('sortBy', 'rating')
      if (sort === 'newest') params.set('sortBy', 'newest')

      const res = await fetch(`/api/global-supply/suppliers?${params.toString()}`)
      if (!res.ok) throw new Error('获取供应商列表失败')
      const json: SupplierListResponse = await res.json()
      if (!json.success) throw new Error('获取供应商列表失败')
      setSuppliers(json.data.items || [])
      setTotalCount(json.data.total || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, filters, sort])

  useEffect(() => { fetchSuppliers() }, [fetchSuppliers])

  const updateFilter = (key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }))
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1) }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  if (loading && suppliers.length === 0) return <SupplierListSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/global-supply" className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400">
            <FiGlobe className="h-4 w-4" />{t('supply.breadcrumb', locale)}
          </Link>
          <span className="text-sm text-gray-300">/</span>
          <span className="truncate text-sm font-semibold text-gray-900">{t('suppliers.title', locale)}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Breadcrumb items={[
          { label: '懒老板', href: '/' },
          { label: '全球供应链', href: '/global-supply' },
          { label: t('suppliers.title', locale) },
        ]} className="mb-4" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('suppliers.title', locale)}</h1>
            {!loading && <p className="mt-1 text-sm text-gray-400">共 {totalCount} 家供应商</p>}
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('suppliers.searchPlaceholder', locale)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 transition-all placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:shadow-ai-glow" />
          </div>
        </form>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center">
            <FiAlertCircle className="mx-auto mb-3 h-8 w-8 text-red-300" />
            <p className="mb-4 text-sm text-gray-600">{error}</p>
            <button onClick={fetchSuppliers} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-400 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500">
              <FiRefreshCw className="h-4 w-4" />{t('common.reload', locale)}
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Desktop filters */}
            <div className="hidden lg:flex items-center gap-2 mb-4" aria-label="筛选条件">
              <FilterDropdown label="地区" options={REGION_OPTIONS} value={filters.region} onChange={(v) => updateFilter('region', v)} />
              <FilterDropdown label="出口资质" options={CERTIFICATION_OPTIONS} value={filters.cert} onChange={(v) => updateFilter('cert', v)} />
              <FilterDropdown label="评分" options={RATING_OPTIONS} value={filters.rating} onChange={(v) => updateFilter('rating', v)} />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">{t('search.sort.label', locale)}</span>
                <FilterDropdown label="综合推荐" options={SORT_OPTIONS} value={sort} onChange={setSort} />
              </div>
            </div>

            {/* Mobile filters */}
            <div className="flex lg:hidden items-center gap-2 mb-3">
              <button onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-brand-200 hover:text-brand-600 min-h-[44px]">
                <FiFilter className="h-4 w-4" /><span>{t('search.filters', locale)}</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-400 text-[10px] font-bold text-white">{activeFilterCount}</span>
                )}
              </button>
              <div className="ml-auto">
                <FilterDropdown label="排序" options={SORT_OPTIONS} value={sort} onChange={setSort} />
              </div>
            </div>
          </>
        )}

        {showMobileFilters && (
          <MobileFilterPanel filters={filters} onFilterChange={updateFilter} onClose={() => setShowMobileFilters(false)} />
        )}

        {activeFilterCount > 0 && !error && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => {
              const allOpts = [...REGION_OPTIONS, ...CERTIFICATION_OPTIONS, ...RATING_OPTIONS]
              const option = allOpts.find((o) => o.value === val)
              return (
                <span key={key} className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs text-brand-600">
                  {option?.label || val}
                  <button onClick={() => updateFilter(key, '')}><FiX className="h-3 w-3" /></button>
                </span>
              )
            })}
            <button onClick={() => setFilters({ region: '', cert: '', rating: '' })} className="ml-1 text-xs text-gray-400 hover:text-gray-600">
              {t('search.filter.clearAll', locale)}
            </button>
          </div>
        )}

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-4 w-28" /><SkeletonBlock className="h-3 w-20" />
                  </div>
                </div>
                <SkeletonBlock className="mb-2 h-3 w-32" /><SkeletonBlock className="mb-2 h-3 w-24" />
                <SkeletonBlock className="mb-2 h-3 w-36" />
                <div className="flex gap-1.5">
                  <SkeletonBlock className="h-5 w-12 rounded" /><SkeletonBlock className="h-5 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && suppliers.length === 0 && (
          <div className="py-20 text-center">
            <FiPackage className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="mb-2 text-lg font-bold text-gray-800">{t('common.noData', locale)}</h2>
            <p className="mb-4 text-sm text-gray-500">{t('search.result.emptyDesc', locale)}</p>
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters({ region: '', cert: '', rating: '' })} className="text-sm font-medium text-brand-500 hover:text-brand-600">
                {t('search.filter.clearAllFilters', locale)}
              </button>
            )}
          </div>
        )}

        {!loading && !error && suppliers.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} isContacted={contactedSupplierIds.has(supplier.id)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3" aria-label="分页导航">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
                  <FiChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">{t('inquiry.pagination.prev', locale)}</span>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-all sm:text-sm ${page === currentPage ? 'bg-brand-400 text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                      {page}
                    </button>
                  ))}
                </div>
                <span className="hidden text-xs text-gray-400 sm:inline">
                  {t('search.pagination.page', locale).replace('{page}', String(currentPage)).replace('{total}', String(totalPages))}
                </span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40">
                  <span className="hidden sm:inline">{t('inquiry.pagination.next', locale)}</span><FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && (
          <div className="mt-10 text-center text-xs text-gray-400">{t('supply.dataSource', locale)}</div>
        )}
      </main>
    </div>
  )
}

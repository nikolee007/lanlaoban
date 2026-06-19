'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import {
  FiSearch,
  FiStar,
  FiMapPin,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiFilter,
  FiX,
  FiPackage,
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
  FiUsers,
  FiGlobe,
} from 'react-icons/fi'

/* ─── Types ─────────────────────────────────────── */

interface SupplierListItem {
  id: number
  nameZh: string
  nameEn: string
  location: string
  yearEstablished: number
  employeeCount: number
  annualExportRevenue: number | null
  certifications: string
  businessTags: string
  exportDestinations: string
  rating: number
  reviewCount: number
  isVerified: boolean
  updatedAt: string
  type: string
  productCount: number
}

interface SupplierListResponse {
  success: boolean
  data: {
    items: SupplierListItem[]
    total: number
  }
}

/* ─── Constants ─────────────────────────────────── */

const REGION_OPTIONS = [
  { label: '全部地区', value: '' },
  { label: '深圳', value: '深圳' },
  { label: '广州', value: '广州' },
  { label: '东莞', value: '东莞' },
  { label: '义乌', value: '义乌' },
  { label: '汕头', value: '汕头' },
  { label: '佛山', value: '佛山' },
]

const CERTIFICATION_OPTIONS = [
  { label: '不限', value: '' },
  { label: 'CE', value: 'CE' },
  { label: 'FCC', value: 'FCC' },
  { label: 'RoHS', value: 'RoHS' },
  { label: 'FDA', value: 'FDA' },
]

const RATING_OPTIONS = [
  { label: '不限', value: '' },
  { label: '4.5星+', value: '4.5' },
  { label: '4.0星+', value: '4.0' },
  { label: '3.5星+', value: '3.5' },
]

const SORT_OPTIONS = [
  { label: '综合推荐', value: 'default' },
  { label: '评分最高', value: 'rating' },
  { label: '最多商品', value: 'products' },
  { label: '最新入驻', value: 'newest' },
]

const ITEMS_PER_PAGE = 12

/* ─── Helpers ───────────────────────────────────── */

function safeJsonParse(input: string | null | undefined): string[] {
  if (!input) return []
  try {
    const parsed = JSON.parse(input)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function StarDisplay({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          className={`h-3 w-3 ${i < full ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </span>
  )
}

/* ─── Filter Dropdown ───────────────────────────── */

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.value === value)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
          value
            ? 'border-brand-300 bg-brand-50 font-medium text-brand-600'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        {current?.label || label}
        <FiChevronDown
          className={`ml-0.5 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              onMouseDown={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                value === o.value ? 'bg-brand-50 font-medium text-brand-600' : 'text-gray-700'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Filter Section (Mobile) ────────────────────── */

function MobileFilterPanel({
  filters,
  onFilterChange,
  onClose,
}: {
  filters: Record<string, string>
  onFilterChange: (key: string, val: string) => void
  onClose: () => void
}) {
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
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('search.filter.region', locale)}</label>
            <div className="flex flex-wrap gap-2">
              {REGION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => onFilterChange('region', o.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    filters.region === o.value
                      ? 'border-brand-300 bg-brand-50 font-medium text-brand-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('search.filter.cert', locale)}</label>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATION_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => onFilterChange('cert', o.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    filters.cert === o.value
                      ? 'border-brand-300 bg-brand-50 font-medium text-brand-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('search.filter.rating', locale)}</label>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => onFilterChange('rating', o.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    filters.rating === o.value
                      ? 'border-brand-300 bg-brand-50 font-medium text-brand-600'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Supplier Card ──────────────────────────────── */

function SupplierCard({ supplier, isContacted }: { supplier: SupplierListItem; isContacted?: boolean }) {
  const { locale } = useLocale()
  const tags = safeJsonParse(supplier.businessTags).slice(0, 3)
  const certs = safeJsonParse(supplier.certifications)

  return (
    <Link
      href={`/global-supply/suppliers/${supplier.id}`}
      className={`card group p-5 transition-all hover:shadow-apple-lg hover:-translate-y-0.5 ${
        isContacted
          ? '!border-violet-200 hover:!border-violet-300'
          : ''
      }`}
    >
      {/* Header: Avatar + Name + Badge */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-400 transition-colors group-hover:bg-amber-50 group-hover:text-amber-500">
          {(supplier.nameZh || '供').charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {supplier.nameZh}
            </h3>
            {supplier.isVerified && (
              <FiAward className="h-4 w-4 shrink-0 text-amber-500" title={t('supply.supplier.verified', locale)} />
            )}
            {supplier.yearEstablished > 0 && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700 shrink-0 whitespace-nowrap">
                已合作 {new Date().getFullYear() - supplier.yearEstablished} 年
              </span>
            )}
            {isContacted && (
              <span className="inline-flex items-center rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 shrink-0 whitespace-nowrap">
                已联系
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray-400">{supplier.nameEn}</p>
        </div>
      </div>

      {/* Location */}
      <div className="mb-2 flex items-center gap-1 text-xs text-gray-400">
        <FiMapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{supplier.location}</span>
      </div>

      {/* Rating */}
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <StarDisplay rating={supplier.rating} />
        <span className="font-medium text-gray-700">{supplier.rating.toFixed(1)}</span>
        <span className="text-gray-300">|</span>
        <span>{supplier.reviewCount} {t('suppliers.reviewCount', locale).replace('{count}', String(supplier.reviewCount))}</span>
      </div>

      {/* Stats row */}
      <div className="mb-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FiPackage className="h-3 w-3" />
          {supplier.productCount} {t('common.unitPieces', locale)}
        </span>
        <span className="flex items-center gap-1">
          <FiUsers className="h-3 w-3" />
          {supplier.employeeCount} {t('common.unitPeople', locale)}
        </span>
      </div>

      {/* Business tags */}
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Certification badges */}
      {certs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {certs.slice(0, 4).map((cert: string) => (
            <span
              key={cert}
              className="inline-flex items-center gap-0.5 rounded border border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700"
            >
              <FiShield className="h-2.5 w-2.5" />
              {cert}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

/* ─── Skeleton ────────────────────────────────────── */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function SupplierListSkeleton() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-12">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <SkeletonBlock className="h-4 w-48" />
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6">
          <SkeletonBlock className="mb-6 h-8 w-40" />
          <SkeletonBlock className="mb-4 h-10 w-full max-w-md rounded-lg" />
          <div className="mb-6 flex gap-2">
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
            <SkeletonBlock className="h-8 w-20 rounded-lg" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="h-3 w-20" />
                  </div>
                </div>
                <SkeletonBlock className="mb-2 h-3 w-32" />
                <SkeletonBlock className="mb-2 h-3 w-24" />
                <SkeletonBlock className="mb-2 h-3 w-36" />
                <div className="flex gap-1.5">
                  <SkeletonBlock className="h-5 w-12 rounded" />
                  <SkeletonBlock className="h-5 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

/* ─── Main Page ─────────────────────────────────── */

export default function SupplierListPage() {
  const router = useRouter()
  const { locale } = useLocale()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({
    region: '',
    cert: '',
    rating: '',
  })
  const [sort, setSort] = useState('default')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [contactedSupplierIds, setContactedSupplierIds] = useState<Set<number>>(new Set())

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  /* ---- Load contacted suppliers from localStorage ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lanlaoban_contacted_suppliers')
      if (raw) {
        const ids: number[] = JSON.parse(raw)
        setContactedSupplierIds(new Set(ids))
      }
    } catch {
      // Silently ignore
    }
  }, [])

  /* ---- Fetch suppliers ---- */
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

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  /* ---- Handlers ---- */
  const updateFilter = (key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }))
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  /* ---- Render ---- */
  if (loading && suppliers.length === 0) return <SupplierListSkeleton />

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">

      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            href="/global-supply"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
          >
            <FiGlobe className="h-4 w-4" />
            {t('supply.breadcrumb', locale)}
          </Link>
          <span className="text-sm text-gray-300">/</span>
          <span className="truncate text-sm font-semibold text-gray-900">{t('suppliers.title', locale)}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: '懒老板', href: '/' },
            { label: '全球供应链', href: '/global-supply' },
            { label: t('suppliers.title', locale) },
          ]}
          className="mb-4"
        />

        {/* Title + Stats */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('suppliers.title', locale)}</h1>
            {!loading && (
              <p className="mt-1 text-sm text-gray-400">
                共 {totalCount} 家供应商
              </p>
            )}
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('suppliers.searchPlaceholder', locale)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 transition-all placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:shadow-ai-glow"
            />
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center">
            <FiAlertCircle className="mx-auto mb-3 h-8 w-8 text-red-300" />
            <p className="mb-4 text-sm text-gray-600">{error}</p>
            <button
              onClick={fetchSuppliers}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-400 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
            >
              <FiRefreshCw className="h-4 w-4" />
              {t('common.reload', locale)}
            </button>
          </div>
        )}

        {/* Filters bar - desktop */}
        {!error && (
          <>
            <div className="hidden lg:flex items-center gap-2 mb-4" aria-label="筛选条件">
              <FilterDropdown
                label="地区"
                options={REGION_OPTIONS}
                value={filters.region}
                onChange={(v) => updateFilter('region', v)}
              />
              <FilterDropdown
                label="出口资质"
                options={CERTIFICATION_OPTIONS}
                value={filters.cert}
                onChange={(v) => updateFilter('cert', v)}
              />
              <FilterDropdown
                label="评分"
                options={RATING_OPTIONS}
                value={filters.rating}
                onChange={(v) => updateFilter('rating', v)}
              />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400">{t('search.sort.label', locale)}</span>
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
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-brand-200 hover:text-brand-600 min-h-[44px]"
              >
                <FiFilter className="h-4 w-4" />
                <span>{t('search.filters', locale)}</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-400 text-[10px] font-bold text-white">
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
          </>
        )}

        {/* Mobile filter panel */}
        {showMobileFilters && (
          <MobileFilterPanel
            filters={filters}
            onFilterChange={updateFilter}
            onClose={() => setShowMobileFilters(false)}
          />
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && !error && (
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {Object.entries(filters)
              .filter(([, v]) => v)
              .map(([key, val]) => {
                const allOpts = [...REGION_OPTIONS, ...CERTIFICATION_OPTIONS, ...RATING_OPTIONS]
                const option = allOpts.find((o) => o.value === val)
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs text-brand-600"
                  >
                    {option?.label || val}
                    <button onClick={() => updateFilter(key, '')}>
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
            <button
              onClick={() => setFilters({ region: '', cert: '', rating: '' })}
              className="ml-1 text-xs text-gray-400 hover:text-gray-600"
            >
              {t('search.filter.clearAll', locale)}
            </button>
          </div>
        )}

        {/* Loading inline */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex items-center gap-3">
                  <SkeletonBlock className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-4 w-28" />
                    <SkeletonBlock className="h-3 w-20" />
                  </div>
                </div>
                <SkeletonBlock className="mb-2 h-3 w-32" />
                <SkeletonBlock className="mb-2 h-3 w-24" />
                <SkeletonBlock className="mb-2 h-3 w-36" />
                <div className="flex gap-1.5">
                  <SkeletonBlock className="h-5 w-12 rounded" />
                  <SkeletonBlock className="h-5 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && suppliers.length === 0 && (
          <div className="py-20 text-center">
            <FiPackage className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="mb-2 text-lg font-bold text-gray-800">{t('common.noData', locale)}</h2>
            <p className="mb-4 text-sm text-gray-500">{t('search.result.emptyDesc', locale)}</p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ region: '', cert: '', rating: '' })}
                className="text-sm font-medium text-brand-500 hover:text-brand-600"
              >
                {t('search.filter.clearAllFilters', locale)}
              </button>
            )}
          </div>
        )}

        {/* Supplier grid */}
        {!loading && !error && suppliers.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} isContacted={contactedSupplierIds.has(supplier.id)} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 sm:gap-3" aria-label="分页导航">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('inquiry.pagination.prev', locale)}</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-medium transition-all sm:text-sm ${
                        page === currentPage
                          ? 'bg-brand-400 text-white shadow-sm'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <span className="hidden text-xs text-gray-400 sm:inline">
                  {t('search.pagination.page', locale).replace('{page}', String(currentPage)).replace('{total}', String(totalPages))}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">{t('inquiry.pagination.next', locale)}</span>
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Data source disclaimer */}
        {!loading && !error && (
          <div className="mt-10 text-center text-xs text-gray-400">
            {t('supply.dataSource', locale)}
          </div>
        )}
      </main>
    </div>
  )
}

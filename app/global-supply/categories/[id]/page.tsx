'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Breadcrumb from '../../../components/Breadcrumb'
import {
  FiGlobe, FiMonitor, FiShoppingBag, FiHome, FiHeart, FiPackage,
  FiAward, FiRefreshCw, FiTrendingUp, FiGrid, FiTool, FiClipboard,
  FiBook, FiWatch, FiCamera, FiVolume2,
  FiAlertCircle, FiThumbsUp, FiClock,
} from 'react-icons/fi'
import CategoryHero, { BANNER_PALETTE, DEFAULT_BANNER } from '../../components/CategoryHero'
import ResultCard, { parseCertifications, parseSalesData } from '../../components/ResultCard'
import type { ResultItem } from '../../components/ResultCard'
import FilterBar from '../../components/FilterBar'

// ── Icon name → component mapping ──
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FiGlobe, FiMonitor, FiShoppingBag, FiHome, FiHeart, FiPackage,
  FiAward, FiRefreshCw, FiTrendingUp, FiGrid, FiTool, FiClipboard,
  FiBook, FiWatch, FiCamera, FiVolume2,
}

// ── API types ──

interface ApiSupplierBrief {
  id: number
  nameZh: string
  nameEn: string
  rating: number
}

interface ApiProductItem {
  id: number
  name: string
  description: string | null
  supplierId: number
  categoryId: number | null
  priceMin: number | null
  priceMax: number | null
  currency: string
  moq: number | null
  supportsDropShipping: boolean
  supportsOEM: boolean
  images: string | null
  certifications: string | null
  salesData: string | null
  rating: number | null
  reviewCount: number | null
  updatedAt: string
  supplier: ApiSupplierBrief
}

interface ApiProductsData {
  items: ApiProductItem[]
  total: number
  categoryName: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

// ── Loading Skeleton ──

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100" />
            <div className="flex-1">
              <div className="h-5 w-48 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-100 mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-4 w-16 rounded bg-gray-100" />
            <div className="h-4 w-20 rounded bg-gray-100" />
          </div>
          <div className="h-4 w-full rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

// ── Page ──

export default function CategorySearchPage() {
  const params = useParams()
  const id = parseInt(params.id as string, 10) || 0

  // Banner visual: deterministic from category ID
  const bannerIndex = id > 0 ? (id - 1) % BANNER_PALETTE.length : 0
  const bannerVisual = BANNER_PALETTE[bannerIndex] || DEFAULT_BANNER
  const BannerIcon = ICON_MAP[bannerVisual.icon] || FiGrid

  const [categoryName, setCategoryName] = useState('')
  const [allResults, setAllResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState<Record<string, string>>({
    region: '',
    rating: '',
  })
  const [sort, setSort] = useState('default')

  const updateFilter = (key: string, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const fetchData = useCallback(() => {
    setLoading(true)
    setError('')

    const paramsUrl = new URLSearchParams()
    paramsUrl.set('pageSize', '100')

    if (sort === 'rating') {
      paramsUrl.set('sortBy', 'rating')
    } else if (sort === 'price-asc') {
      paramsUrl.set('sortBy', 'priceMin')
    } else if (sort === 'price-desc') {
      paramsUrl.set('sortBy', 'priceMax')
    }

    fetch(`/api/global-supply/categories/${id}/products?${paramsUrl.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('获取分类商品失败')
        return res.json()
      })
      .then((response: ApiResponse<ApiProductsData>) => {
        if (!response.success) throw new Error(response.error || '获取分类商品失败')
        const data = response.data
        const items = data?.items || []
        const catName = data?.categoryName || `分类 #${id}`
        setCategoryName(catName)

        const mapped: ResultItem[] = items.map((item: ApiProductItem) => {
          const certTags = parseCertifications(item.certifications)
          const monthlySales = parseSalesData(item.salesData)
          return {
            id: item.id,
            name: item.name,
            location: item.supplier.nameZh || item.supplier.nameEn || '未知',
            rating: item.rating ?? 0,
            reviewCount: item.reviewCount ?? 0,
            tags: certTags,
            minOrder: item.moq ?? 0,
            dropship: item.supportsDropShipping,
            updatedAt: item.updatedAt,
            priceMin: item.priceMin ?? undefined,
            priceMax: item.priceMax ?? undefined,
            monthlySales,
            description: item.description ?? undefined,
          }
        })
        setAllResults(mapped)
      })
      .catch(err => {
        setError(err.message || '网络错误，请稍后重试')
      })
      .finally(() => setLoading(false))
  }, [id, sort])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ── Client-side filter (region, rating) ──
  const filteredResults = useMemo(() => {
    let items = [...allResults]

    if (filters.region) {
      items = items.filter(i => i.location.includes(filters.region))
    }
    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      items = items.filter(i => i.rating >= minRating)
    }

    if (sort === 'sales' || sort === 'default') {
      items.sort((a, b) => (b.monthlySales || 0) - (a.monthlySales || 0))
    } else if (sort === 'price-asc') {
      items.sort((a, b) => (a.priceMin || 99999) - (b.priceMin || 99999))
    } else if (sort === 'price-desc') {
      items.sort((a, b) => (b.priceMin || 0) - (a.priceMin || 0))
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating)
    }

    return items
  }, [allResults, filters, sort])

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Category Banner */}
      {!error && (
        <CategoryHero
          categoryName={categoryName}
          loading={loading}
          resultCount={allResults.length}
          icon={BannerIcon}
          gradient={bannerVisual.gradient}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: '懒老板', href: '/' },
            { label: '全球供应链', href: '/global-supply' },
            { label: '全部分类', href: '/global-supply/categories' },
            { label: categoryName || '分类详情' },
          ]}
          className="mb-4"
        />

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16">
            <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-400 hover:bg-brand-500 px-5 py-2.5 rounded-xl transition-all"
            >
              <FiRefreshCw className="w-4 h-4" />
              重新加载
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && <LoadingSkeleton />}

        {/* Data loaded */}
        {!loading && !error && (
          <>
            {/* Search info */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  搜索结果
                </h2>
                <span className="text-sm text-gray-400">
                  找到 {filteredResults.length} 个结果
                </span>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                最近更新: 数据实时同步
              </span>
            </div>

            {/* Filters + Sort */}
            <FilterBar
              filters={filters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onFilterChange={updateFilter}
              onSortChange={setSort}
              onClearAll={() => setFilters({ region: '', rating: '' })}
            />

            {/* Empty state */}
            {filteredResults.length === 0 && (
              <div className="text-center py-20">
                <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">没有找到匹配的结果</h2>
                <p className="text-sm text-gray-500 mb-4">试试调整筛选条件</p>
                <button
                  onClick={() => setFilters({ region: '', rating: '' })}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  清除所有筛选
                </button>
              </div>
            )}

            {/* Results */}
            {filteredResults.length > 0 && (
              <div className="space-y-4">
                {filteredResults.map((item) => (
                  <div key={item.id}>
                    <ResultCard item={item} />
                  </div>
                ))}
              </div>
            )}

            {/* Footer hint */}
            {filteredResults.length > 0 && (
              <div className="mt-8 mb-12 flex items-center justify-center gap-2 text-sm text-gray-400">
                <FiThumbsUp className="w-4 h-4" />
                <span>懒老板 AI 持续监测全球供应链数据，为您推荐最优货源</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../../components/Breadcrumb'
import {
  FiSearch, FiChevronDown, FiPackage, FiHome, FiStar, FiMapPin,
  FiHeart, FiMessageSquare, FiVideo, FiClock, FiTrendingUp,
  FiCheck, FiFilter, FiX, FiThumbsUp, FiAlertCircle,
  FiGlobe, FiShoppingBag, FiTruck, FiMonitor, FiGrid,
  FiRefreshCw, FiAward, FiTool, FiClipboard, FiBook,
  FiWatch, FiCamera, FiVolume2,
} from 'react-icons/fi'

// ── Visual palette (cycled by category ID for consistent color per category) ──
const BANNER_PALETTE = [
  { gradient: 'from-blue-500 to-blue-700', icon: FiGlobe },
  { gradient: 'from-purple-500 to-violet-600', icon: FiMonitor },
  { gradient: 'from-pink-500 to-rose-600', icon: FiShoppingBag },
  { gradient: 'from-green-500 to-emerald-600', icon: FiHome },
  { gradient: 'from-rose-500 to-pink-600', icon: FiHeart },
  { gradient: 'from-amber-500 to-yellow-600', icon: FiPackage },
  { gradient: 'from-teal-500 to-cyan-600', icon: FiAward },
  { gradient: 'from-lime-500 to-green-600', icon: FiRefreshCw },
  { gradient: 'from-cyan-500 to-blue-600', icon: FiTrendingUp },
  { gradient: 'from-violet-500 to-purple-600', icon: FiGrid },
  { gradient: 'from-gray-500 to-slate-600', icon: FiTool },
  { gradient: 'from-indigo-500 to-blue-600', icon: FiClipboard },
  { gradient: 'from-sky-500 to-blue-600', icon: FiBook },
  { gradient: 'from-yellow-500 to-amber-600', icon: FiWatch },
  { gradient: 'from-stone-500 to-amber-700', icon: FiCamera },
  { gradient: 'from-red-500 to-rose-600', icon: FiVolume2 },
  { gradient: 'from-emerald-500 to-teal-600', icon: FiHeart },
]

const DEFAULT_BANNER = { gradient: 'from-gray-500 to-gray-700', icon: FiGrid }

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

// ── Display type ──
interface CertTag {
  label: string
  color: string
}

interface ResultItem {
  id: number
  name: string
  location: string
  rating: number
  reviewCount: number
  tags: CertTag[]
  minOrder: number
  dropship: boolean
  updatedAt: string
  priceMin?: number
  priceMax?: number
  monthlySales?: number
  description?: string
}

// ── Filter Definitions ──

interface FilterOption {
  label: string
  value: string
}

interface FilterGroup {
  key: string
  label: string
  options: FilterOption[]
}

const FILTER_GROUPS: FilterGroup[] = [
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

// ── Helpers ──

function daysAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '1天前'
  return `${diff}天前`
}

function renderStars(rating: number) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          className={`w-3.5 h-3.5 ${
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && half
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-gray-200'
          }`}
        />
      ))}
    </span>
  )
}

function parseCertifications(raw: string | null): CertTag[] {
  if (!raw) return []
  try {
    const list: string[] = JSON.parse(raw)
    const colors = [
      'bg-green-50 text-green-700',
      'bg-blue-50 text-blue-700',
      'bg-purple-50 text-purple-700',
      'bg-amber-50 text-amber-700',
      'bg-cyan-50 text-cyan-700',
      'bg-rose-50 text-rose-700',
    ]
    return list.map((label, i) => ({
      label,
      color: colors[i % colors.length],
    }))
  } catch {
    return []
  }
}

function parseSalesData(raw: string | null): number | undefined {
  if (!raw) return undefined
  try {
    const data = JSON.parse(raw)
    return data.monthlySales ?? data.sales ?? undefined
  } catch {
    return undefined
  }
}

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

// ── Result Card ──

function ResultCard({ item }: { item: ResultItem }) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 hover:border-brand-200 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-lg p-2.5 flex-shrink-0 bg-brand-50 text-brand-400">
          <FiPackage className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
            <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-brand-50 text-brand-600">
              产品
            </span>
          </div>
          {item.priceMin !== undefined && (
            <p className="text-sm text-gray-500 mt-0.5">
              出厂价 <span className="text-brand-500 font-semibold">¥{item.priceMin}{item.priceMax ? `-${item.priceMax}` : ''}</span>
            </p>
          )}
        </div>
        {item.monthlySales && (
          <div className="hidden sm:flex flex-col items-end flex-shrink-0">
            <span className="text-lg font-bold text-brand-400">{item.monthlySales.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400">月销量</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
        <span className="inline-flex items-center gap-1">
          {renderStars(item.rating)}
          <span className="text-gray-400 ml-0.5">{item.rating.toFixed(1)}</span>
        </span>
        <span className="text-gray-300">|</span>
        <span className="inline-flex items-center gap-1">
          <FiMapPin className="w-3 h-3" />
          {item.location}
        </span>
        <span className="text-gray-300">|</span>
        <span className="inline-flex items-center gap-1">
          <FiMessageSquare className="w-3 h-3" />
          {item.reviewCount}评价
        </span>
      </div>

      {item.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {item.tags.map(t => (
            <span key={t.label} className={`text-[11px] px-2 py-0.5 rounded font-medium ${t.color}`}>
              {t.label}
            </span>
          ))}
          {item.dropship && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-cyan-50 text-cyan-700">
              一件代发
            </span>
          )}
        </div>
      )}

      {item.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-3 border-b border-gray-50">
        <span className="inline-flex items-center gap-1">
          最小起订: <span className="text-gray-700 font-medium">{item.minOrder}件</span>
        </span>
        <span className="text-gray-200">|</span>
        <span className="inline-flex items-center gap-1">
          一件代发: <span className={item.dropship ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {item.dropship ? '支持' : '不支持'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            saved
              ? 'border-brand-200 bg-brand-50 text-brand-600'
              : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <FiHeart className={`w-3.5 h-3.5 ${saved ? 'fill-brand-400 text-brand-400' : ''}`} />
          {saved ? '已收藏' : '收藏'}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all">
          <FiMessageSquare className="w-3.5 h-3.5" />
          联系
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-400 text-white hover:bg-brand-500 transition-all">
          <FiVideo className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">生成视频素材</span>
          <span className="sm:hidden">视频</span>
        </button>
        <span className="hidden sm:flex items-center gap-1 ml-auto text-[11px] text-gray-400">
          <FiClock className="w-3 h-3" />
          {daysAgo(item.updatedAt)}
        </span>
      </div>

      <div className="flex sm:hidden items-center gap-1 mt-2 text-[11px] text-gray-400">
        <FiClock className="w-3 h-3" />
        数据更新: {daysAgo(item.updatedAt)}
      </div>
    </div>
  )
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
  const BannerIcon = bannerVisual.icon

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

    // Map sort to API sortBy
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

    // Client-side sort for "sales" and "default" (not supported by API)
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
        <div className={`bg-gradient-to-r ${bannerVisual.gradient} text-white`}>
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
                <BannerIcon className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">{categoryName || '分类加载中...'}</h1>
                <p className="text-sm text-white/80 max-w-xl">该分类下的产品和服务</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
                  {!loading && (
                    <span className="inline-flex items-center gap-1">
                      <FiPackage className="w-3.5 h-3.5" />
                      共 {allResults.length} 个搜索结果
                    </span>
                  )}
                  {loading && (
                    <span className="inline-flex items-center gap-1">
                      <FiPackage className="w-3.5 h-3.5" />
                      加载中...
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    数据来自全球供应链网络
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            {/* Search info + Sort */}
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

            {/* Filters bar */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              {FILTER_GROUPS.map(g => (
                <FilterDropdown
                  key={g.key}
                  label={g.label}
                  options={g.options}
                  value={filters[g.key]}
                  onChange={v => updateFilter(g.key, v)}
                />
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-gray-400 mr-1">排序:</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
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
                      <button onClick={() => updateFilter(key, '')}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
                <button
                  onClick={() => setFilters({ region: '', rating: '' })}
                  className="text-xs text-gray-400 hover:text-gray-600 ml-1"
                >
                  清除全部
                </button>
              </div>
            )}

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

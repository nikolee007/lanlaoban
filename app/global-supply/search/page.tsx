'use client'

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import SearchSuggest from '../../components/SearchSuggest'
import CompareDrawer from '../../components/CompareDrawer'
import VideoGenerateModal from '../../components/VideoGenerateModal'
import ContactModal from '../../components/ContactModal'
import OptimizedImage from '../../components/OptimizedImage'
import { useCompare } from '../../contexts/CompareContext'
import type { CompareItem } from '../../contexts/CompareContext'
import { useToast } from '../../contexts/ToastContext'
import trendingData from '../../../lib/global-supply/trending-data.json'
import {
  FiSearch, FiChevronDown, FiPackage, FiStar, FiMapPin,
  FiHeart, FiMessageSquare, FiVideo, FiClock, FiTrendingUp,
  FiCheck, FiFilter, FiX, FiThumbsUp, FiAlertCircle,
  FiBarChart2, FiChevronLeft, FiChevronRight,
  FiShoppingCart, FiUsers, FiShield,
} from 'react-icons/fi'
import { productPlaceholderSVG , loadProductImageMap, setProductImageMap
} from '@/lib/product-placeholder'
import {
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  parsePrefixedId,
  collectionKey,
  daysAgo,
  tagColor,
  mapSortParam,
  applyMinOrderFilter,
  mapSearchResults,
  mapProductResults,
  unpackSearchData,
  INSIGHT,
  FILTER_GROUPS,
  SORT_OPTIONS,
  ITEMS_PER_PAGE,
  CATEGORY_KEYWORDS,
} from '../search-utils'
import type { SearchResultItem, InsightCard } from '../search-utils'

// ── Trending data constants ──
const trendingTerms: { keyword: string; heatScore: number; category: string }[] =
  (trendingData as any).trendingSearchTerms || []
const trendingSuggestionList: string[] = trendingTerms.map((t) => t.keyword)
const trendingHotTags: { label: string; heatScore: number }[] = trendingTerms
  .slice(0, 12)
  .map((t) => ({ label: t.keyword, heatScore: t.heatScore }))

// ── API Response Types ──
interface SearchResponse {
  success: boolean
  data: {
    products: any[]
    suppliers: any[]
    total: number
    query: string
    page?: number
    pageSize?: number
  }
  error?: string
}

interface ProductsResponse {
  success: boolean
  data: {
    items: any[]
    total: number
    page: number
    pageSize: number
  }
  error?: string
}

// ── Filter Dropdown ──
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
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border shadow-sm transition-all whitespace-nowrap ${
          value
            ? 'border-brand-300 bg-brand-50 text-brand-600 font-medium'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        {value && <FiCheck className="w-3.5 h-3.5" />}
        {current?.label || label}
        <FiChevronDown
          className={`w-3.5 h-3.5 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[140px] py-1">
          {options.map((o) => (
            <button
              key={o.value}
              onMouseDown={() => {
                onChange(o.value)
                setOpen(false)
              }}
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

// ── Star Renderer ──
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

// ── Skeleton Card ──
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-14" />
          <div className="h-6 bg-gray-200 rounded w-14" />
          <div className="h-6 bg-gray-200 rounded w-14" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
        </div>
      </div>
    </div>
  )
}

// ── Result Card ──
function ResultCard({
  item,
  saved,
  onToggleSave,
  onOpenVideo,
  onOpenContact,
}: {
  item: SearchResultItem
  saved: boolean
  onToggleSave: (item: SearchResultItem) => void
  onOpenVideo?: (name: string) => void
  onOpenContact?: (name: string) => void
}) {
  const isProduct = item.type === 'product'
  const { isInCompare, toggleItem } = useCompare()

  const detailHref = isProduct
    ? `/global-supply/${item.id.replace('p_', '')}`
    : `/global-supply/suppliers/${item.id.replace('s_', '')}`

  const selected = isInCompare(item.id)
  const ci: CompareItem = {
    id: item.id,
    name: item.name,
    image: productPlaceholderSVG(item.name, 200, 200, item.id),
    price: item.priceMin ? `¥${item.priceMin}-${item.priceMax}` : '询价',
    moq: `${item.minOrder}件`,
    dropship: item.dropship,
    oem: item.tags.some((t) => t.label === 'OEM'),
    rating: item.rating,
    location: item.location,
  }

  return (
    <div
      className={`group rounded-2xl border border-gray-100/80 bg-white overflow-hidden shadow-apple transition-all duration-300 ${
        selected
          ? '!border-brand-300 ring-1 ring-brand-200 shadow-apple-md'
          : 'hover:border-brand-200 hover:shadow-apple-md'
      }`}
    >
      {/* ── Image Section ── */}
      <Link href={detailHref} className="relative block aspect-video bg-gray-100 overflow-hidden">
        <OptimizedImage
          src={productPlaceholderSVG(item.name, 600, 338, item.id)}
          alt={item.name}
          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Compare checkbox */}
        <label
          className="absolute top-3 left-3 z-10 flex items-center gap-1 cursor-pointer bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm hover:bg-white transition-colors"
          aria-label="添加到对比"
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleItem(ci)}
            className="sr-only peer"
          />
          <div
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              selected
                ? 'border-brand-400 bg-brand-400'
                : 'border-gray-300 peer-checked:border-brand-400 peer-checked:bg-brand-400'
            }`}
          >
            {selected && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={`text-[11px] font-medium ${selected ? 'text-brand-500' : 'text-gray-500'}`}>
            对比
          </span>
        </label>

        {/* Badge: certified */}
        {item.certified && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
            <FiShield className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-[11px] font-semibold text-gray-700">企业认证</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isProduct ? 'bg-brand-500/90 text-white' : 'bg-indigo-500/90 text-white'
            }`}
          >
            {isProduct ? '产品' : '工厂'}
          </span>
        </div>

        {/* 最近更新标签 */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
          <FiClock className="w-3 h-3 text-gray-500" />
          <span className="text-[11px] font-medium text-gray-600">最近更新: {daysAgo(item.updatedAt)}</span>
        </div>
      </Link>

      {/* ── Content Section ── */}
      <div className="p-4 sm:p-5">
        {/* Name + monthly sales */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href={detailHref} className="font-semibold text-gray-900 text-sm sm:text-base leading-tight hover:text-brand-500 transition-colors">{item.name}</Link>
          {isProduct && item.monthlySales && item.monthlySales > 0 && (
            <div className="hidden sm:flex flex-col items-end flex-shrink-0">
              <span className="text-lg font-bold text-brand-400">{item.monthlySales.toLocaleString()}</span>
              <span className="text-[11px] text-gray-400">月销量</span>
            </div>
          )}
        </div>

        {/* Price display */}
        {isProduct && item.priceMin !== undefined && (
          <div className="mt-1.5 mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-brand-500">¥{item.priceMin}</span>
              <span className="text-gray-400">-</span>
              <span className="text-lg font-bold text-brand-500">¥{item.priceMax}</span>
              <span className="text-xs text-gray-400 ml-1">出厂价</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
              <span>小批量: ¥{item.priceSmallBatch}/件</span>
              <span className="text-gray-300">|</span>
              <span>大批量 ({item.priceBulkThreshold}+): ¥{item.priceMin}/件</span>
            </div>
          </div>
        )}

        {/* Factory categories */}
        {!isProduct && item.categories && item.categories.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 mb-2">{item.categories.join(' · ')}</p>
        )}

        {/* Rating + Location + Reviews */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            {renderStars(item.rating)}
            <span className="text-gray-400 ml-0.5">{item.rating}</span>
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

        {/* Tags */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {(item.tags || []).map((t) => (
            <span key={t.label} className={`text-[11px] px-2 py-0.5 rounded font-medium ${t.color}`}>
              {t.label}
            </span>
          ))}
          {item.dropship && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-cyan-50 text-cyan-700 inline-flex items-center gap-1">
              <FiPackage className="w-3 h-3" />
              一件代发
            </span>
          )}
        </div>

        {/* Channel info */}
        {item.channelCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <FiUsers className="w-3.5 h-3.5 text-gray-400" />
            <span>
              已对接 <strong className="text-gray-700">{item.channelCount}</strong> 家渠道
            </span>
            {(item.channelNames || []).length > 0 && <span className="text-gray-300 mx-0.5">·</span>}
            {(item.channelNames || []).length > 0 && (
              <span className="text-gray-400 truncate max-w-[180px] sm:max-w-[280px]">
                {(item.channelNames || []).slice(0, 3).join(' · ')}
                {(item.channelNames || []).length > 3 && ' 等'}
              </span>
            )}
          </div>
        )}

        {/* Trend tag */}
        {item.trendTag && (
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                item.trendTag.hot
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-orange-50 text-orange-600 border border-orange-100'
              }`}
            >
              {item.trendTag.hot && <FiTrendingUp className="w-3.5 h-3.5" />}
              {item.trendTag.text}
            </span>
          </div>
        )}

        {/* Factory-specific info */}
        {!isProduct && (
          <div className="mb-2 flex items-center gap-4 text-xs text-gray-500">
            {item.yearEstablished && <span>成立: {item.yearEstablished}</span>}
            {item.employeeCount && <span>规模: {item.employeeCount}</span>}
          </div>
        )}

        {/* Order info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
          <span className="inline-flex items-center gap-1">
            <FiShoppingCart className="w-3 h-3 text-gray-400" />
            最小起订: <span className="text-gray-700 font-medium">{item.minOrder}件</span>
          </span>
          <span className="text-gray-200">|</span>
          <span className="inline-flex items-center gap-1">
            一件代发:
            <span className={item.dropship ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {item.dropship ? '支持' : '不支持'}
            </span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(item)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              saved
                ? 'border-brand-200 bg-brand-50 text-brand-600'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <FiHeart className={`w-3.5 h-3.5 ${saved ? 'fill-brand-400 text-brand-400' : ''}`} />
            {saved ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={() => onOpenContact?.(item.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-brand-200 hover:text-brand-600 hover:bg-brand-50 transition-all"
          >
            <FiMessageSquare className="w-3.5 h-3.5" />
            联系
          </button>
          <button
            onClick={() => onOpenVideo?.(item.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-400 text-white hover:bg-brand-500 transition-all"
          >
            <FiVideo className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">生成视频素材</span>
            <span className="sm:hidden">视频</span>
          </button>
          <span className="hidden sm:flex items-center gap-1 ml-auto text-[11px] text-gray-400">
            <FiClock className="w-3 h-3" />
            {daysAgo(item.updatedAt)}
          </span>
        </div>

        {/* Mobile updated time */}
        <div className="flex sm:hidden items-center gap-1 mt-2 text-[11px] text-gray-400">
          <FiClock className="w-3 h-3" />
          数据更新: {daysAgo(item.updatedAt)}
        </div>
      </div>
    </div>
  )
}

// ── Insight Card ──
function InsightCardBlock({ insight }: { insight: InsightCard }) {
  const maxVal = Math.max(...insight.trendData.map((d) => d.value))

  return (
    <div className="bg-gradient-to-br from-brand-50 via-orange-50/30 to-purple-50/30 rounded-2xl border border-brand-100/80 p-4 sm:p-5 shadow-apple">
      <div className="flex items-start gap-3 mb-4">
        <div className="rounded-lg bg-brand-100 p-2 flex-shrink-0">
          <FiBarChart2 className="w-5 h-5 text-brand-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-brand-600">{insight.title}</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{insight.content}</p>
        </div>
      </div>

      {/* CSS Bar Chart */}
      <div className="bg-white/80 rounded-lg border border-brand-100 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiTrendingUp className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-semibold text-gray-600">热门品类搜索增长趋势 (近30天)</span>
        </div>
        <div className="space-y-2.5">
          {(insight.trendData || []).map((d) => (
            <div key={d.label} className="flex items-center gap-2 sm:gap-3">
              <span className="w-16 sm:w-20 text-xs text-gray-500 text-right flex-shrink-0 truncate">
                {d.label}
              </span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(d.value / maxVal) * 100}%`,
                    background:
                      d.direction === 'up'
                        ? 'linear-gradient(90deg, #FF6034, #FF8A5C)'
                        : d.direction === 'down'
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #9ca3af, #d1d5db)',
                  }}
                />
              </div>
              <span
                className={`w-10 sm:w-12 text-xs font-semibold text-right flex-shrink-0 ${
                  d.direction === 'up'
                    ? 'text-green-600'
                    : d.direction === 'down'
                      ? 'text-red-500'
                      : 'text-gray-400'
                }`}
              >
                {d.change}
              </span>
              <span className="w-4 flex-shrink-0">
                {d.direction === 'up' ? (
                  <FiTrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : d.direction === 'down' ? (
                  <FiTrendingUp className="w-3.5 h-3.5 text-red-500 rotate-180" />
                ) : (
                  <span className="block w-3.5 h-0.5 bg-gray-400 rounded-full" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Pagination ──
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 mb-6" aria-label="分页导航">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <FiChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">上一页</span>
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-medium rounded-xl transition-all ${
              page === currentPage
                ? 'bg-brand-400 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <span className="hidden sm:inline text-xs text-gray-400 mx-1">
        第{currentPage}页/共{totalPages}页
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        <span className="hidden sm:inline">下一页</span>
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Page Inner ──
function GlobalSupplySearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''

  const [localQuery, setLocalQuery] = useState(query)
  const [showHeaderSuggestions, setShowHeaderSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // Load search history on mount
  useEffect(() => {

  // 加载产品图片映射
  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])
    setSearchHistory(getSearchHistory())
  }, [])

  // Sync localQuery when URL query changes
  useEffect(() => {
    setLocalQuery(query)
  }, [query])

  const handleHeaderSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return
      saveSearchHistory(q.trim())
      setSearchHistory(getSearchHistory())
      router.push(`/global-supply/search?q=${encodeURIComponent(q.trim())}`)
    },
    [router],
  )

  const handleClearHistory = useCallback(() => {
    clearSearchHistory()
    setSearchHistory([])
  }, [])

  const [filters, setFilters] = useState<Record<string, string>>({
    category: '',
    region: '',
    minOrder: '',
    cert: '',
    rating: '',
    priceMin: '',
    priceMax: '',
    dropship: '',
  })
  const [sort, setSort] = useState('default')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // API state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allResults, setAllResults] = useState<SearchResultItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [collections, setCollections] = useState<Set<string>>(new Set())

  // Modal state
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false)
  const [videoModalName, setVideoModalName] = useState<string | null>(null)
  const [contactModalName, setContactModalName] = useState<string | null>(null)
  const { items: compareItems } = useCompare()
  const { showToast } = useToast()

  const isSearchMode = !!query

  // ── Fetch collections on mount ──
  useEffect(() => {
    let cancelled = false
    const fetchCollections = async () => {
      try {
        const t = localStorage.getItem('lanlaoban_token')
        const res = await fetch('/api/global-supply/collections', {
          headers: t ? { 'Authorization': `Bearer ${t}` } : {},
        })
        // Unwrap API response: { success, data: [...] }
        const json = await res.json()
        if (cancelled) return
        const data = json?.data || json || {}
        const items = Array.isArray(data) ? data : Array.isArray(json?.data) ? json.data : []
        if (json.success && Array.isArray(items)) {
          const ids = new Set<string>(
            items.map((c: { targetType: string; targetId: string }) => `${c.targetType}:${c.targetId}`),
          )
          setCollections(ids)
        }
      } catch {
        // Silently fail — collections are non-critical
      }
    }
    fetchCollections()
    return () => {
      cancelled = true
    }
  }, [])

  // ── Fetch results from API ──
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.set('page', String(currentPage))
        params.set('pageSize', String(ITEMS_PER_PAGE))

        // Common filter params
        if (filters.region) params.set('region', filters.region)
        if (filters.cert) params.set('certification', filters.cert)
        if (filters.rating) params.set('minRating', filters.rating)
        if (filters.priceMin) params.set('minPrice', filters.priceMin)
        if (filters.priceMax) params.set('maxPrice', filters.priceMax)
        if (filters.dropship) params.set('dropship', 'true')

        // Category -> keywords (for server-side filtering)
        if (filters.category && CATEGORY_KEYWORDS[filters.category]) {
          params.set('keyword', CATEGORY_KEYWORDS[filters.category].join(','))
        }

        // Sort
        const apiSort = mapSortParam(sort)
        if (apiSort) params.set('sortBy', apiSort)

        if (isSearchMode) {
          // ── Search mode: call search API (returns products + suppliers) ──
          params.set('q', query)

          const res = await fetch(`/api/global-supply/search?${params.toString()}`)
          const json: SearchResponse = await res.json()
          if (cancelled) return
          if (!json.success) {
            throw new Error(json.error || '搜索失败')
          }

          // Unwrap API response layer by layer
          const data = unpackSearchData(json)

          let mapped = mapSearchResults(data)

          // Client-side: minOrder filter (not supported by search API)
          if (filters.minOrder) {
            mapped = applyMinOrderFilter(mapped, filters.minOrder)
          }

          setAllResults(mapped)
          setTotalResults(data.total)
        } else {
          // ── Browse mode: call products API ──
          if (filters.category && CATEGORY_KEYWORDS[filters.category]) {
            params.set('search', CATEGORY_KEYWORDS[filters.category].join(' '))
          }
          params.delete('q')
          params.delete('keyword')

          const res = await fetch(`/api/global-supply/products?${params.toString()}`)
          const json: ProductsResponse = await res.json()
          if (cancelled) return
          if (!json.success) {
            throw new Error(json.error || '获取数据失败')
          }

          // Unwrap: { success, data: { items: [...], total } }
          const responseData = json?.data || {}
          const items = Array.isArray(responseData.items) ? responseData.items : []
          let mapped = mapProductResults(items)

          // Client-side: minOrder filter
          if (filters.minOrder) {
            mapped = applyMinOrderFilter(mapped, filters.minOrder)
          }

          setAllResults(mapped)
          setTotalResults(responseData.total || 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '请求失败，请稍后重试')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [query, filters, sort, currentPage, isSearchMode])

  // ── Pagination ──
  const displayPageSize = isSearchMode ? ITEMS_PER_PAGE * 2 : ITEMS_PER_PAGE
  const totalPages = Math.max(1, Math.ceil(totalResults / displayPageSize))
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1))

  const displayCount = totalResults > 0 ? totalResults : allResults.length

  const updateFilter = (key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }))
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  // Custom labels for non-FILTER_GROUPS filters
  const CUSTOM_FILTER_LABELS: Record<string, (val: string) => string> = {
    priceMin: (v) => `最低价 ¥${v}`,
    priceMax: (v) => `最高价 ¥${v}`,
    dropship: () => '一件代发',
  }

  // ── Collection toggle handler ──
  const handleToggleSave = useCallback(
    async (item: SearchResultItem) => {
      const token = localStorage.getItem('lanlaoban_token')
      if (!token) {
        showToast('请先登录，才能使用此功能', 'warning')
        return
      }
      const parsed = parsePrefixedId(item.id)
      if (!parsed) return
      const key = collectionKey(item.id)
      const isSaved = collections.has(key)

      try {
        if (isSaved) {
          const token = localStorage.getItem('lanlaoban_token')
          const delHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
          if (token) delHeaders['Authorization'] = `Bearer ${token}`
          const res = await fetch('/api/global-supply/collections', {
            method: 'DELETE',
            headers: delHeaders,
            body: JSON.stringify({ targetId: parsed.id, targetType: parsed.type }),
          })
          const json = await res.json()
          if (json.success) {
            setCollections((prev) => {
              const next = new Set(prev)
              next.delete(key)
              return next
            })
            showToast('已取消收藏', 'info')
          }
        } else {
          const token = localStorage.getItem('lanlaoban_token')
          const postHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
          if (token) postHeaders['Authorization'] = `Bearer ${token}`
          const res = await fetch('/api/global-supply/collections', {
            method: 'POST',
            headers: postHeaders,
            body: JSON.stringify({ targetId: parsed.id, targetType: parsed.type }),
          })
          const json = await res.json()
          if (json.success) {
            setCollections((prev) => {
              const next = new Set(prev)
              next.add(key)
              return next
            })
            showToast(' 已收藏到资源库', 'success')
          }
        }
      } catch {
        // Silently fail
      }
    },
    [collections, showToast],
  )

  // ── Most recent update text ──
  const mostRecentUpdate = useMemo(() => {
    if (allResults.length === 0) return '-'
    const sorted = [...allResults].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    return daysAgo(sorted[0].updatedAt)
  }, [allResults])

  const displayQuery = query || '全球供应链'

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">

      {/* Header with search bar */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-400 text-sm font-bold text-white">
              懒
            </div>
            <div className="relative flex-1 max-w-xl">
              <FiSearch className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onFocus={() => setShowHeaderSuggestions(true)}
                onBlur={() => setTimeout(() => setShowHeaderSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleHeaderSearch(localQuery)
                }}
                placeholder="搜索全球供应链产品/工厂..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-brand-200 focus:bg-white focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,96,52,0.12)]"
              />
              {/* Clear button */}
              {localQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalQuery('')
                    setShowHeaderSuggestions(true)
                  }}
                  className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
              {/* Dropdown: history + hot tags when focused & empty */}
              {showHeaderSuggestions && !localQuery && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
                  {searchHistory.length > 0 && (
                    <div className="p-3 pb-1">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">最近搜索</span>
                        <button
                          type="button"
                          onClick={handleClearHistory}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          清除
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(searchHistory || []).slice(0, 5).map((h) => (
                          <button
                            key={h}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleHeaderSearch(h)}
                            className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-500"
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Hot tags */}
                  <div className={searchHistory.length > 0 ? 'border-t border-gray-50 p-3' : 'p-3'}>
                    <div className="mb-2 text-xs font-medium text-gray-400">热门搜索</div>
                    <div className="flex flex-wrap gap-2">
                      {(trendingHotTags || []).slice(0, 12).map((tag) => (
                        <button
                          key={tag.label}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleHeaderSearch(tag.label)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-500"
                        >
                          {tag.label}
                          {tag.heatScore != null && (
                            <span className="text-[10px] text-gray-400">{tag.heatScore}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Suggestions dropdown when typing */}
              {localQuery && (
                <SearchSuggest
                  query={localQuery}
                  suggestions={trendingSuggestionList}
                  onSelect={handleHeaderSearch}
                  onSearch={handleHeaderSearch}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: '懒老板', href: '/' },
            { label: '全球供应链', href: '/global-supply' },
            { label: '搜索结果' },
          ]}
          className="mb-3"
        />

        {/* Search info */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {isSearchMode ? `搜索 "${displayQuery}"` : '全球供应链'}
            </h1>
            {!loading && (
              <span className="text-sm text-gray-400">
                找到 {displayCount} 个结果
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            最近更新: {mostRecentUpdate}
          </span>
        </div>

        {/* Filters bar - desktop */}
        <div className="hidden lg:flex items-center gap-2 mb-4 overflow-x-auto pb-1" aria-label="筛选条件">
          {(FILTER_GROUPS || []).map((g) => (
            <FilterDropdown
              key={g.key}
              label={g.label}
              options={g.options}
              value={filters[g.key]}
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
                          filters[g.key] === o.value
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
                onClick={() => setFilters({ category: '', region: '', minOrder: '', cert: '', rating: '', priceMin: '', priceMax: '', dropship: '' })}
                className="mt-3 text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                清除所有筛选
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
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
              onClick={() => setFilters({ category: '', region: '', minOrder: '', cert: '', rating: '', priceMin: '', priceMax: '', dropship: '' })}
              className="text-xs text-gray-400 hover:text-gray-600 ml-1"
            >
              清除全部
            </button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <FiAlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-brand-400 text-white hover:bg-brand-500 transition-colors"
            >
              重新加载
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {!error && loading && (
          <div className="space-y-4">
            {(Array.from({ length: 4 }) || []).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state (no query — show trending recommendations) */}
        {!loading && !error && !query && allResults.length === 0 && (
          <div className="py-12">
            <div className="mb-8 text-center">
              <FiTrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900">全球供应链热门搜索</h2>
              <p className="mt-1 text-sm text-gray-500">选一个热门词开始查找优质货源</p>
            </div>
            <div className="mx-auto max-w-2xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {(trendingTerms || []).slice(0, 16).map((term) => (
                  <button
                    key={term.keyword}
                    type="button"
                    onClick={() => handleHeaderSearch(term.keyword)}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                  >
                    <span className="text-sm font-medium text-gray-800 group-hover:text-brand-500">
                      {term.keyword}
                    </span>
                    <span className="text-xs text-gray-400">
                      热度 {term.heatScore}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state (query returned no results) */}
        {!loading && !error && query && allResults.length === 0 && (
          <div className="text-center py-20">
            <FiAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">没有找到相关商品</h2>
            <p className="text-sm text-gray-500 mb-6">试试其他关键词</p>
            {activeFilterCount > 0 && (
              <button
                onClick={() => setFilters({ category: '', region: '', minOrder: '', cert: '', rating: '', priceMin: '', priceMax: '', dropship: '' })}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                清除所有筛选
              </button>
            )}
            {/* 推荐热门搜索 */}
            <div className="mt-8">
              <p className="text-xs text-gray-400 mb-3">推荐热门搜索</p>
              <div className="flex flex-wrap justify-center gap-2">
                {trendingTerms.slice(0, 8).map((term) => (
                  <button
                    key={term.keyword}
                    onClick={() => handleHeaderSearch(term.keyword)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-200 hover:text-brand-500 transition-colors"
                  >
                    {term.keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && allResults.length > 0 && (
          <div className="space-y-4" role="list">
            {(allResults || []).map((item, index) => (
              <div key={item.id} role="listitem" className="animate-stagger" style={{ animationDelay: `${index * 40}ms` }}>
                <ResultCard
                  item={item}
                  saved={collections.has(collectionKey(item.id))}
                  onToggleSave={handleToggleSave}
                  onOpenVideo={setVideoModalName}
                  onOpenContact={setContactModalName}
                />
                {/* Insert insight card after 4th item on page 1 */}
                {index === 3 && safeCurrentPage === 1 && (
                  <div className="my-4">
                    <InsightCardBlock insight={INSIGHT} />
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Footer hint */}
        {!loading && !error && allResults.length > 0 && (
          <div className="mt-8 mb-12 flex items-center justify-center gap-2 text-sm text-gray-400">
            <FiThumbsUp className="w-4 h-4" />
            <span>懒老板 AI 持续监测全球供应链数据，为您推荐最优货源</span>
          </div>
        )}

        {/* 数据来源声明 */}
        {!loading && !error && <DataDisclaimer />}
      </main>

      {/* Floating compare bar */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-sm text-gray-600">
              已选 <strong className="text-brand-500">{compareItems.length}</strong> 件
            </span>
            <button
              onClick={() => setCompareDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
            >
              <FiBarChart2 className="h-4 w-4" />
              对比
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CompareDrawer open={compareDrawerOpen} onClose={() => setCompareDrawerOpen(false)} />
      <VideoGenerateModal
        open={videoModalName !== null}
        onClose={() => setVideoModalName(null)}
        productName={videoModalName ?? undefined}
      />
      <ContactModal
        open={contactModalName !== null}
        onClose={() => setContactModalName(null)}
        supplierName={contactModalName ?? undefined}
      />
    </div>
  )
}

/* ─── 数据来源声明 ────────────── */

function DataDisclaimer() {
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const d = new Date()
    setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }, [])
  return (
    <div className="mb-6 text-center text-xs text-gray-400">
      数据来源: 百度企业信用 / 1688 / 企查查等多平台公开信息 | 更新于: {dateStr}
    </div>
  )
}

// ── Page Export: useSearchParams must be wrapped in Suspense ──
export default function GlobalSupplySearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <GlobalSupplySearchPageInner />
    </Suspense>
  )
}

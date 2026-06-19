'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import {
  FiSearch, FiHeart, FiClock, FiGrid, FiPackage, FiStar,
  FiMapPin, FiX, FiChevronRight, FiAlertCircle, FiTrash2,
  FiRefreshCw, FiMessageSquare, FiShoppingBag, FiUsers,
  FiBarChart2, FiList, FiShield, FiCheckCircle, FiTag,
} from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { productPlaceholderSVG, getCategoryInfo , loadProductImageMap, setProductImageMap
} from '@/lib/product-placeholder'
import { useToast } from '../../contexts/ToastContext'
import { useCompare } from '../../contexts/CompareContext'
import type { CompareItem } from '../../contexts/CompareContext'

/* ─── Types ─────────────────────────────────────────── */

type TabKey = 'products' | 'suppliers' | 'inquiries' | 'inquiry-products' | 'cart' | 'compare'

type SortKey = 'date-desc' | 'date-asc' | 'price-asc' | 'price-desc'

type ViewMode = 'list' | 'grid'

/** Collection target — shape returned by the API */
interface ApiProductTarget {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  currency: string
  images: string | null
  rating: number | null
}

interface ApiSupplierTarget {
  id: number
  nameZh: string | null
  nameEn: string | null
  location: string | null
  rating: number | null
  isVerified: boolean
  businessTags: string | null
}

interface ApiCollectionItem {
  id: number
  userId: number
  targetId: string
  targetType: 'product' | 'supplier'
  userNote: string | null
  createdAt: string
  target: ApiProductTarget | ApiSupplierTarget | null
}

interface ApiResponse {
  success: boolean
  data: ApiCollectionItem[]
  error?: string
}

/** Display types after mapping */
interface ProductRecord {
  id: string
  collectionId: number
  targetId: string
  name: string
  priceMin: number | null
  priceMax: number | null
  savedAt: string
  rating: number | null
}

interface SupplierRecord {
  id: string
  collectionId: number
  targetId: string
  name: string
  nameZh: string | null
  nameEn: string | null
  location: string | null
  rating: number | null
  isVerified: boolean
  businessTags: string[]
  savedAt: string
}

interface InquiryRecord {
  id: string
  supplierName: string
  contactName: string
  message: string
  createdAt: string
  status: 'pending' | 'replied' | 'closed'
}

interface InquiryProductRecord {
  id: string
  productName: string
  priceMin: number | null
  priceMax: number | null
  inquiryDate: string
  status: 'pending' | 'replied' | 'closed'
  supplierName: string
}

interface CartItemRecord {
  id: string
  productName: string
  priceMin: number | null
  priceMax: number | null
  quantity: number
  addedAt: string
}

/* ─── Constants ─────────────────────────────────────── */

const TABS: { key: TabKey; labelKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'products',        labelKey: 'resources.tab.products',   icon: FiHeart },
  { key: 'suppliers',       labelKey: 'resources.tab.suppliers', icon: FiUsers },
  { key: 'inquiry-products', labelKey: 'resources.tab.inquiries', icon: FiMessageSquare },
  { key: 'cart',            labelKey: 'resources.tab.cart',     icon: FiShoppingBag },
  { key: 'inquiries',       labelKey: 'resources.tab.inquiries', icon: FiList },
  { key: 'compare',         labelKey: 'resources.tab.compare',     icon: FiBarChart2 },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date-desc',  label: '收藏时间 latest' },
  { key: 'date-asc',   label: '收藏时间 earliest' },
  { key: 'price-asc',  label: '价格 low to high' },
  { key: 'price-desc', label: '价格 high to low' },
]

const MOCK_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq_1',
    supplierName: '东莞华强电子科技有限公司',
    contactName: '张三',
    message: '请问这款蓝牙耳机的 MOQ 是多少？支持 OEM 定制吗？',
    createdAt: '2026-05-28T10:30:00Z',
    status: 'replied',
  },
  {
    id: 'inq_2',
    supplierName: '义乌小商品国际贸易有限公司',
    contactName: '李四',
    message: '我们想批量采购家居用品，有现货吗？',
    createdAt: '2026-05-25T14:20:00Z',
    status: 'pending',
  },
  {
    id: 'inq_3',
    supplierName: '广州白云皮具厂',
    contactName: '王五',
    message: '定制一批手提包，你们的起订量是多少？',
    createdAt: '2026-05-20T09:15:00Z',
    status: 'closed',
  },
  {
    id: 'inq_4',
    supplierName: '深圳华强北科技有限公司',
    contactName: '赵六',
    message: '你们的电子产品有没有 FCC/CE 认证？',
    createdAt: '2026-05-15T16:00:00Z',
    status: 'replied',
  },
  {
    id: 'inq_5',
    supplierName: '福建泉州鞋业有限公司',
    contactName: '孙七',
    message: '运动鞋可以定制品牌 Logo 吗？最小起订量多少双？',
    createdAt: '2026-05-10T09:30:00Z',
    status: 'closed',
  },
]

const MOCK_INQUIRY_PRODUCTS: InquiryProductRecord[] = [
  {
    id: 'ip_1',
    productName: 'TWS蓝牙耳机 ANC主动降噪 蓝牙5.3',
    priceMin: 35,
    priceMax: 68,
    inquiryDate: '2026-05-28T10:30:00Z',
    status: 'replied',
    supplierName: '东莞华强电子科技有限公司',
  },
  {
    id: 'ip_2',
    productName: '智能手表 心率血氧监测 运动手环',
    priceMin: 88,
    priceMax: 158,
    inquiryDate: '2026-05-25T14:20:00Z',
    status: 'pending',
    supplierName: '深圳华强北科技有限公司',
  },
  {
    id: 'ip_3',
    productName: '便携式蓝牙音箱 IPX7防水 低音炮',
    priceMin: 55,
    priceMax: 120,
    inquiryDate: '2026-05-20T09:15:00Z',
    status: 'replied',
    supplierName: '广州白云电子厂',
  },
  {
    id: 'ip_4',
    productName: '无线充电器 15W快充 三合一折叠',
    priceMin: 28,
    priceMax: 52,
    inquiryDate: '2026-05-15T16:00:00Z',
    status: 'closed',
    supplierName: '东莞华强电子科技有限公司',
  },
  {
    id: 'ip_5',
    productName: '运动蓝牙耳机 挂耳式 跑步专用',
    priceMin: 42,
    priceMax: 78,
    inquiryDate: '2026-05-10T09:30:00Z',
    status: 'replied',
    supplierName: '福建泉州电子有限公司',
  },
]

const MOCK_CART_ITEMS: CartItemRecord[] = [
  {
    id: 'ci_1',
    productName: '便携式蓝牙音箱 IPX7防水 低音炮',
    priceMin: 55,
    priceMax: 120,
    quantity: 500,
    addedAt: '2026-05-30T14:00:00Z',
  },
  {
    id: 'ci_2',
    productName: 'TWS蓝牙耳机 ANC主动降噪 蓝牙5.3',
    priceMin: 35,
    priceMax: 68,
    quantity: 1000,
    addedAt: '2026-05-28T10:30:00Z',
  },
  {
    id: 'ci_3',
    productName: '智能手表 心率血氧监测 运动手环',
    priceMin: 88,
    priceMax: 158,
    quantity: 200,
    addedAt: '2026-05-25T14:20:00Z',
  },
  {
    id: 'ci_4',
    productName: 'USB-C 数据线 快充 编织线 1.2m',
    priceMin: 5,
    priceMax: 12,
    quantity: 5000,
    addedAt: '2026-05-22T09:00:00Z',
  },
]

const INQUIRY_STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: '待回复', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  replied: { label: '已回复', color: 'bg-green-50 text-green-700 border-green-200' },
  closed:  { label: '已关闭', color: 'bg-gray-50 text-gray-500 border-gray-200' },
}

/* ─── Utilities ─────────────────────────────────────── */

function pad(n: number) { return String(n).padStart(2, '0') }

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return formatDate(iso)
}

function parseBusinessTags(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch {
    return []
  }
}

function renderStars(rating: number | null | undefined): string {
  if (rating == null) return '—'
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full))
}

function safePriceDisplay(min: number | null, max: number | null): string {
  if (min != null && max != null) {
    if (min === max) return `¥${min}`
    return `¥${min} — ¥${max}`
  }
  if (min != null) return `¥${min}起`
  if (max != null) return `¥${max}以内`
  return '询价'
}

/* ─── Sub-components ────────────────────────────────── */

function TabEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-9 h-9 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-8 text-center max-w-xs">{description}</p>
      <Link
        href="/global-supply"
        className="inline-flex items-center gap-2 bg-brand-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-400/20 active:scale-[0.98]"
      >
        <FiShoppingBag className="w-4 h-4" />
        {actionLabel}
        <FiChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 shrink-0" />
            <div className="flex-1 pt-0.5 space-y-2">
              <div className="h-5 w-48 rounded bg-gray-100" />
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="h-4 w-40 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Star rating display for suppliers */
function RatingDisplay({ rating }: { rating: number | null }) {
  const { locale } = useLocale()
  if (rating == null) return <span className="text-xs text-gray-400">{t('common.noData', locale)}</span>
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500">
      <FiStar className="w-3.5 h-3.5 fill-current" />
      <span>{rating.toFixed(1)}</span>
    </span>
  )
}

/* ─── Main Component ────────────────────────────────── */

export default function MyResourcesPage() {
  const { locale } = useLocale()
  /* ── Compare context ── */
  const compareCtx = useCompare()

  /* ── Collections state ── */
  const [collections, setCollections] = useState<ApiCollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unfavoriting, setUnfavoriting] = useState<Set<string>>(new Set())

  /* ── UI state ── */
  const [activeTab, setActiveTab] = useState<TabKey>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { showToast } = useToast()

  /* ── Get data from compare context ── */
  const compareItems = compareCtx.items

  /* ── Fetch collections ── */
  const fetchCollections = useCallback(() => {
    setLoading(true)
    setError('')
    const t = localStorage.getItem("lanlaoban_token");
    fetch("/api/global-supply/collections", {
      headers: t ? { "Authorization": `Bearer ${t}` } : {},
    })
      .then(res => {
        return res.json()
      })
      .then((response: ApiResponse) => {
        if (!response.success) throw new Error('获取收藏数据失败')
        setCollections(Array.isArray(response.data) ? response.data : [])
      })
      .catch(err => {
        setError(err.message || '网络错误，请稍后重试')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {

  // 加载产品图片映射
  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])
    fetchCollections()
  }, [fetchCollections])

  /* ── Partition collections ── */
  const { productRecords, supplierRecords } = useMemo(() => {
    const products: ProductRecord[] = []
    const suppliers: SupplierRecord[] = []

    for (const col of collections) {
      if (col.targetType === 'product' && col.target) {
        const t = col.target as ApiProductTarget
        products.push({
          id: `p_${col.targetId}`,
          collectionId: col.id,
          targetId: col.targetId,
          name: t.name || '',
          priceMin: t.priceMin,
          priceMax: t.priceMax,
          savedAt: col.createdAt,
          rating: t.rating,
        })
      } else if (col.targetType === 'supplier' && col.target) {
        const t = col.target as ApiSupplierTarget
        suppliers.push({
          id: `s_${col.targetId}`,
          collectionId: col.id,
          targetId: col.targetId,
          name: t.nameZh || t.nameEn || '',
          nameZh: t.nameZh,
          nameEn: t.nameEn,
          location: t.location,
          rating: t.rating,
          isVerified: t.isVerified,
          businessTags: parseBusinessTags(t.businessTags),
          savedAt: col.createdAt,
        })
      }
    }

    return { productRecords: products, supplierRecords: suppliers }
  }, [collections])

  const productCount = productRecords.length
  const supplierCount = supplierRecords.length
  const totalCount = productCount + supplierCount

  /* ── Filtered products (Tab 1) ── */
  const filteredProducts = useMemo(() => {
    let items = [...productRecords]

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(r => r.name.toLowerCase().includes(q))
    }

    switch (sortKey) {
      case 'date-desc':
        items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
        break
      case 'date-asc':
        items.sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime())
        break
      case 'price-asc':
        items.sort((a, b) => (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity))
        break
      case 'price-desc':
        items.sort((a, b) => (b.priceMin ?? 0) - (a.priceMin ?? 0))
        break
    }

    return items
  }, [productRecords, searchQuery, sortKey])

  /* ── Filtered suppliers (Tab 2) ── */
  const filteredSuppliers = useMemo(() => {
    let items = [...supplierRecords]

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      items = items.filter(r => r.name.toLowerCase().includes(q))
    }

    return items
  }, [supplierRecords, searchQuery])

  /* ── Unfavorite ── */
  const handleUnfavorite = useCallback(async (item: ProductRecord | SupplierRecord) => {
    const targetType = item.id.startsWith('p_') ? 'product' : 'supplier'
    setUnfavoriting(prev => new Set(prev).add(item.id))
    try {
      const t = localStorage.getItem('lanlaoban_token')
      const res = await fetch('/api/global-supply/collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(t ? { 'Authorization': `Bearer ${t}` } : {}) },
        body: JSON.stringify({ targetId: item.targetId, targetType }),
      })
      if (!res.ok) throw new Error('取消失败')
      setCollections(prev => prev.filter(c => String(c.targetId) !== item.targetId))
    } catch {
      showToast('取消失败，请重试', 'error')
    } finally {
      setUnfavoriting(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }, [showToast])

  /* ── Remove from compare ── */
  const handleRemoveCompare = useCallback((item: CompareItem) => {
    compareCtx.removeItem(item.id)
    showToast('已从对比清单移除', 'success')
  }, [compareCtx, showToast])

  /* ── Search clear helper ── */
  const handleClearSearch = useCallback(() => setSearchQuery(''), [])

  /* ── Collect counts per tab for badges ── */
  const tabBadge = useCallback((key: TabKey): number | null => {
    switch (key) {
      case 'products':         return productCount
      case 'suppliers':        return supplierCount
      case 'inquiries':        return MOCK_INQUIRIES.length
      case 'inquiry-products': return MOCK_INQUIRY_PRODUCTS.length
      case 'cart':             return MOCK_CART_ITEMS.length
      case 'compare':          return compareItems.length
    }
  }, [productCount, supplierCount, compareItems.length])

  /* ── Handle tab change (clear search) ── */
  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key)
    setSearchQuery('')
  }, [])

  /* ── Page-level loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center text-white font-bold">懒</div>
              <span className="font-semibold text-gray-900">全球供应链</span>
            </div>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">首页</Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <LoadingSkeleton />
        </main>
      </div>
    )
  }

  /* ── Page-level error ── */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center text-white font-bold">懒</div>
              <span className="font-semibold text-gray-900">全球供应链</span>
            </div>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">首页</Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20">
            <FiAlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchCollections}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-brand-400 hover:bg-brand-500 px-5 py-2.5 rounded-xl transition-all"
            >
              <FiRefreshCw className="w-4 h-4" />
              重新加载
            </button>
          </div>
        </main>
      </div>
    )
  }

  /* ─── Main UI ─────────────────────────────────────── */

  const showSearchBar = activeTab === 'products' || activeTab === 'suppliers'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-400 rounded-xl flex items-center justify-center text-white font-bold">懒</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{t('nav.supply', locale)}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t('nav.resources', locale)}</span>
              </div>
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">首页</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: '懒老板', href: '/' },
            { label: t('nav.supply', locale), href: '/global-supply' },
            { label: t('nav.resources', locale) },
          ]}
          className="mb-4"
        />

        {/* Title + Stats */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
            <FiHeart className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('nav.resources', locale)}</h1>
            <p className="text-xs text-gray-400">
              {totalCount > 0
                ? `共收藏 ${totalCount} 件资源`
                : '收藏你感兴趣的商品和供应商'}
            </p>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => {
            const badge = tabBadge(tab.key)
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-brand-400 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(tab.labelKey, locale)}
                {badge != null && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Search + Sort + View toggle ── */}
        {showSearchBar && (
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
                  onClick={handleClearSearch}
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
        )}

        {/* ── Search result count ── */}
        {searchQuery && (
          <p className="text-xs text-gray-400 mb-3">
            {t('search.result', locale)} {activeTab === 'products' ? filteredProducts.length : filteredSuppliers.length} {t('search.results', locale)}
          </p>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/*  TAB 1 — 收藏的商品                              */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <>
            {filteredProducts.length === 0 && searchQuery && productCount > 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiSearch className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{t('search.result.empty', locale)}</h3>
                <p className="text-sm text-gray-500 mb-4">{t('search.result.emptyDesc', locale)}</p>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  {t('search.clear', locale)}
                </button>
              </div>
            )}

            {filteredProducts.length === 0 && !searchQuery && (
              <TabEmptyState
                icon={FiPackage}
                title={t('resources.tab.products', locale)}
                description={t('resources.tab.products', locale)}
                actionLabel={t('cart.browseProducts', locale)}
              />
            )}

            {filteredProducts.length > 0 && (
              <>
                {/* List view */}
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredProducts.map(item => {
                      const isUnfavoriting = unfavoriting.has(item.id)
                      const priceText = safePriceDisplay(item.priceMin, item.priceMax)
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-4 p-4">
                            {/* Thumbnail */}
                            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                              <img
                                src={productPlaceholderSVG(item.name, 160, 160, item.targetId)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name || t('common.noData', locale)}</h3>
                              <p className="text-sm font-medium text-brand-500 mt-0.5">{priceText}</p>
                              <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-1">
                                <FiClock className="w-3 h-3" />
                                {t('common.save', locale)}于 {timeAgo(item.savedAt)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="shrink-0 flex flex-col items-end gap-2">
                              <button
                                onClick={() => handleUnfavorite(item)}
                                disabled={isUnfavoriting}
                                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                                {isUnfavoriting ? '取消中...' : '取消收藏'}
                              </button>
                              <Link
                                href={`/global-supply/search?q=${encodeURIComponent(item.name)}`}
                                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-white text-brand-400 border border-brand-400 hover:bg-brand-50 transition-all whitespace-nowrap"
                              >
                                <FiSearch className="w-3.5 h-3.5" />
                                搜索同类
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Grid view */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(item => {
                      const isUnfavoriting = unfavoriting.has(item.id)
                      const priceText = safePriceDisplay(item.priceMin, item.priceMax)
                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group"
                        >
                          {/* Thumbnail */}
                          <div className="aspect-square bg-gray-100 overflow-hidden relative">
                            <img
                              src={productPlaceholderSVG(item.name, 300, 300, item.targetId)}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Category badge */}
                            <div className="absolute top-2 left-2">
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                (() => {
                                  const info = getCategoryInfo(item.name)
                                  return `bg-white/90 text-gray-700 backdrop-blur-sm`
                                })()
                              }`}>
                                {getCategoryInfo(item.name).category}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3">
                            <h3 className="font-medium text-gray-900 text-sm truncate leading-snug">{item.name || '未命名商品'}</h3>
                            <p className="text-sm font-bold text-brand-500 mt-1">{priceText}</p>
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              <FiClock className="w-3 h-3 inline mr-0.5" />
                              {timeAgo(item.savedAt)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
                              <button
                                onClick={() => handleUnfavorite(item)}
                                disabled={isUnfavoriting}
                                className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                <FiTrash2 className="w-3 h-3" />
                                {isUnfavoriting ? '取消中' : '取消收藏'}
                              </button>
                              <Link
                                href={`/global-supply/search?q=${encodeURIComponent(item.name)}`}
                                className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg text-brand-400 hover:bg-brand-50 transition-colors"
                              >
                                <FiSearch className="w-3 h-3" />
                                搜索同类
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/*  TAB 2 — 收藏的供应商                             */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'suppliers' && (
          <>
            {filteredSuppliers.length === 0 && searchQuery && supplierCount > 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiSearch className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">没有找到 &ldquo;{searchQuery}&rdquo;</h3>
                <p className="text-sm text-gray-500 mb-4">试试换个关键词搜索</p>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  清除搜索
                </button>
              </div>
            )}

            {filteredSuppliers.length === 0 && !searchQuery && (
              <TabEmptyState
                icon={FiUsers}
                title={t('resources.tab.suppliers', locale)}
                description={t('resources.tab.suppliers', locale)}
                actionLabel={t('cart.browseProducts', locale)}
              />
            )}

            {filteredSuppliers.length > 0 && (
              <div className="space-y-3">
                {filteredSuppliers.map(item => {
                  const isUnfavoriting = unfavoriting.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Avatar */}
                        <div className="shrink-0 w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 font-bold text-lg">
                          {(item.nameZh || item.nameEn || '?').charAt(0)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name || t('common.noData', locale)}</h3>
                            {item.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded-full">
                                <FiShield className="w-3 h-3" />
                                {t('supply.supplier.verified', locale)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            {item.location && (
                              <span className="inline-flex items-center gap-1">
                                <FiMapPin className="w-3 h-3" />
                                {item.location}
                              </span>
                            )}
                            <RatingDisplay rating={item.rating} />
                          </div>
                          {/* Business tags */}
                          {item.businessTags.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {item.businessTags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <button
                            onClick={() => handleUnfavorite(item)}
                            disabled={isUnfavoriting}
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            {isUnfavoriting ? '取消中...' : '取消收藏'}
                          </button>
                          <Link
                            href={`/global-supply/${item.targetId}`}
                            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-white text-brand-400 border border-brand-400 hover:bg-brand-50 transition-all whitespace-nowrap"
                          >
                            <FiMessageSquare className="w-3.5 h-3.5" />
                            联系供应商
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/*  TAB 3 — 已询价的商品                             */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'inquiry-products' && (
          <>
            {MOCK_INQUIRY_PRODUCTS.length === 0 && (
              <TabEmptyState
                icon={FiPackage}
                title="还没有询价的商品"
                description="联系供应商询价后，已询价的商品会显示在这里"
                actionLabel="去发现好货"
              />
            )}

            {MOCK_INQUIRY_PRODUCTS.length > 0 && (
              <div className="space-y-3">
                {MOCK_INQUIRY_PRODUCTS.map(item => {
                  const statusMeta = INQUIRY_STATUS_META[item.status] || INQUIRY_STATUS_META.pending
                  const priceText = safePriceDisplay(item.priceMin, item.priceMax)
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Thumbnail */}
                        <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                          <img
                            src={productPlaceholderSVG(item.productName, 128, 128, item.id)}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm">{item.productName}</h3>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-brand-500 mt-0.5">{priceText}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <FiUsers className="w-3 h-3" />
                              {item.supplierName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              询价于 {timeAgo(item.inquiryDate)}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <FiChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    </div>
                  )
                })}

                {/* Hint for future API */}
                <p className="text-center text-xs text-gray-400 pt-2 pb-4">
                  已询价商品列表从 /api/global-supply/inquiries 获取，API 就绪后自动对接
                </p>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/*  TAB 4 — 采购清单                                 */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'cart' && (
          <>
            {MOCK_CART_ITEMS.length === 0 && (
              <TabEmptyState
                icon={FiShoppingBag}
                title="采购清单还是空的"
                description="添加商品到采购清单，方便统一管理和跟进采购进度"
                actionLabel="去发现好货"
              />
            )}

            {MOCK_CART_ITEMS.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500">
                    共 {MOCK_CART_ITEMS.length} 件商品
                  </p>
                </div>

                <div className="space-y-3">
                  {MOCK_CART_ITEMS.map(item => {
                    const priceText = safePriceDisplay(item.priceMin, item.priceMax)
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4 p-4">
                          {/* Thumbnail */}
                          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                            <img
                              src={productPlaceholderSVG(item.productName, 128, 128, item.id)}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm">{item.productName}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-medium text-brand-500">{priceText}</span>
                              <span className="text-gray-300">|</span>
                              <span className="text-xs text-gray-500">采购量: <strong className="text-gray-700">{item.quantity.toLocaleString()}</strong> 件</span>
                            </div>
                            <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-1">
                              <FiClock className="w-3 h-3" />
                              添加于 {timeAgo(item.addedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Hint for future API */}
                <p className="text-center text-xs text-gray-400 pt-4 pb-4">
                  采购清单从 /api/global-supply/cart 获取，API 就绪后自动对接
                </p>
              </>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/*  TAB 5 — 询盘记录                                */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'inquiries' && (
          <>
            {MOCK_INQUIRIES.length === 0 && (
              <TabEmptyState
                icon={FiMessageSquare}
                title="还没有询盘记录"
                description="联系供应商后，询盘记录会显示在这里，方便你追踪沟通进度"
                actionLabel="去发现好货"
              />
            )}

            {MOCK_INQUIRIES.length > 0 && (
              <div className="space-y-3">
                {MOCK_INQUIRIES.map(inquiry => {
                  const statusMeta = INQUIRY_STATUS_META[inquiry.status] || INQUIRY_STATUS_META.pending
                  return (
                    <div
                      key={inquiry.id}
                      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 text-sm">{inquiry.supplierName}</h3>
                              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                                {statusMeta.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="inline-flex items-center gap-1">
                                <FiTag className="w-3 h-3" />
                                {inquiry.contactName}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{inquiry.message}</p>
                            <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 mt-2">
                              <FiClock className="w-3 h-3" />
                              {timeAgo(inquiry.createdAt)}
                            </p>
                          </div>
                          <div className="shrink-0 pt-1">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              {inquiry.status === 'replied' && <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Hint for future API */}
                <p className="text-center text-xs text-gray-400 pt-2 pb-4">
                  询盘记录 API 即将上线，届时将同步所有联系历史
                </p>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/*  TAB 6 — 对比清单                                */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === 'compare' && (
          <>
            {compareItems.length === 0 && (
              <TabEmptyState
                icon={FiBarChart2}
                title="还没有对比商品"
                description="在商品列表中勾选添加到对比，最多同时对比 4 件商品"
                actionLabel="去发现好货"
              />
            )}

            {compareItems.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500">
                    已对比 {compareItems.length} 件商品
                    {compareItems.length < 4 && <span> （还可添加 {4 - compareItems.length} 件）</span>}
                  </p>
                  <button
                    onClick={() => { compareCtx.clearAll(); showToast('已清空对比清单', 'success') }}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    清空全部
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {compareItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Thumbnail */}
                        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FiPackage className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-sm font-medium text-brand-500 mt-0.5">{item.price}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 flex-wrap">
                            <span>MOQ: {item.moq}</span>
                            {item.location && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span>{item.location}</span>
                              </>
                            )}
                            {item.rating > 0 && (
                              <>
                                <span className="text-gray-300">|</span>
                                <span className="inline-flex items-center gap-0.5">
                                  <FiStar className="w-3 h-3 text-amber-400 fill-current" />
                                  {item.rating}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveCompare(item)}
                          className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="移出对比"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View comparison button */}
                {compareItems.length >= 2 && (
                  <div className="mt-6 flex justify-center">
                    <Link
                      href="/global-supply/search"
                      className="inline-flex items-center gap-2 bg-brand-400 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-400/20 active:scale-[0.98]"
                    >
                      <FiShoppingBag className="w-4 h-4" />
                      继续发现好货
                      <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}

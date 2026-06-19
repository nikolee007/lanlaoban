'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '../../components/Breadcrumb'
import {
  FiArrowLeft,
  FiStar,
  FiHeart,
  FiClock,
  FiShare2,
  FiTruck,
  FiGlobe,
  FiCheckCircle,
  FiMessageSquare,
  FiThumbsUp,
  FiShield,
  FiBarChart2,
  FiZap,
  FiPlus,
  FiMapPin,
  FiPackage,
  FiCalendar,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowRight,
  FiShoppingCart,
  FiEye,
} from 'react-icons/fi'
import { productPlaceholderSVG, loadProductImageMap, setProductImageMap } from '@/lib/product-placeholder'
import CompareDrawer from '../../components/CompareDrawer'
import VideoGenerateModal from '../../components/VideoGenerateModal'
import ContactModal from '../../components/ContactModal'
import { useCompare } from '../../contexts/CompareContext'
import type { CompareItem } from '../../contexts/CompareContext'
import OptimizedImage from '../../components/OptimizedImage'
import { useToast } from '../../contexts/ToastContext'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

/* ------------------------------------------------------------------ */
/*  API Types                                                          */
/* ------------------------------------------------------------------ */

interface ApiAggregatedReview {
  id: number
  platform: string
  rating: number
  reviewCount: number
  returnRate: number | null
  repurchaseRate: number | null
  keywords: string | null
  collectedAt: string
}

interface ApiProductResponse {
  success: boolean
  data: {
    id: number
    name: string
    description: string | null
    supplierId: number
    priceMin: number | null
    priceMax: number | null
    moq: number | null
    supportsDropShipping: boolean
    supportsOEM: boolean
    images: string | null
    certifications: string | null
    rating: number | null
    reviewCount: number | null
    updatedAt: string
    categoryId: number | null
    supplier: {
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
      type: string
    } | null
    aggregatedReviews: ApiAggregatedReview[]
    relatedProducts: Array<{
      id: number
      name: string
      priceMin: number | null
      priceMax: number | null
      images: string | null
      rating: number | null
      reviewCount: number | null
      supplier: { nameZh: string; nameEn: string; location: string } | null
    }>
  }
}

interface CollectionItem {
  id: number
  userId: string
  targetId: string
  targetType: string
  createdAt: string
}

interface CollectionsResponse {
  success: boolean
  data: CollectionItem[]
}

interface RelatedListItem {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  images: string | null
  rating: number | null
  reviewCount: number | null
  supplier: { nameZh: string; nameEn: string; location: string } | null
}

interface RelatedProductsResponse {
  success: boolean
  data: {
    items: RelatedListItem[]
    total: number
    page: number
    pageSize: number
  }
}

/* ------------------------------------------------------------------ */
/*  UI Product Type                                                    */
/* ------------------------------------------------------------------ */

interface UIEnterprise {
  name: string
  location: string
  established: number
  employeeCount: number
  annualExport: string
  certifications: string[]
  mainBusiness: string
  exportDestinations: string[]
  partnerBrands: string[]
  monthlyCapacity: string
  deliveryCycle: string
  paymentMethods: string[]
}

interface UIProduct {
  priceRange: string
  moq: string
  dropshipping: boolean
  oem: boolean
  specs: Record<string, string>
}

interface UIPlatformRating {
  rating: number
  reviewCount: number
  collectedAt: string
}

interface UIReview {
  id: string
  username: string
  avatar: string
  rating: number
  content: string
  time: string
  platform: string
}

interface UIRelatedProduct {
  id: string
  name: string
  image: string
  price: string
  rating: number
  reviews: number
  supplier: string
}

interface UIProductData {
  id: string
  name: string
  badges: string[]
  rating: number
  reviewCount: number
  dataUpdatedAt: string
  images: string[]
  categoryId: number | null
  enterprise: UIEnterprise
  product: UIProduct
  platforms: Record<string, UIPlatformRating>
  reviews: UIReview[]
  relatedProducts: UIRelatedProduct[]
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PLATFORM_COLORS: Record<string, string> = {
  '1688': 'bg-orange-500',
  Amazon: 'bg-amber-600',
  TikTokShop: 'bg-pink-500',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const stars = Math.round(value)
  return (
    <span className={`inline-flex items-center gap-0.5 ${size === 'md' ? 'text-lg' : 'text-sm'}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <FiStar
          key={i}
          className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Image Carousel                                                     */
/* ------------------------------------------------------------------ */

function ImageCarousel({ images }: { images: string[] }) {
  const { locale } = useLocale()
  const [current, setCurrent] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const hasMultiple = images.length > 1

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white" role="region" aria-label={t('detail.imageAlt', locale)}>
      {/* Main Image */}
      <div
        className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-gray-100 sm:aspect-[16/9]"
        onClick={() => setZoomed(!zoomed)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <OptimizedImage
          src={images[current]}
          alt={t('detail.imageAlt', locale).replace('{index}', String(current + 1))}
          className={`h-full w-full object-cover transition-all duration-300 ${
            zoomed ? 'scale-150' : 'scale-100'
          }`}
          width={800}
          height={600}
        />
        {/* Nav Arrows — only show when multiple images */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={t('detail.prevImage', locale)}
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={t('detail.nextImage', locale)}
            >
              <FiArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
        {/* Dots — only show when multiple images */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={`h-2 rounded-full transition-all ${
                  i === current
                    ? 'w-6 bg-brand-400'
                    : 'w-2 bg-white/60 hover:bg-white/90'
                }`}
                aria-label={t('detail.imageCount', locale).replace('{index}', String(i + 1))}
              />
            ))}
          </div>
        )}
        {/* Image Counter */}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white backdrop-blur-sm">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto px-3 py-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === current
                  ? 'border-brand-400 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <OptimizedImage
                src={img}
                alt={t('detail.thumbnailAlt', locale).replace('{index}', String(i + 1))}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
}

function DetailSkeleton() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <SkeletonBlock className="h-5 w-20" />
            <SkeletonBlock className="h-5 w-48" />
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6">
          <SkeletonBlock className="mb-4 h-4 w-64" />
          <SkeletonBlock className="mb-6 aspect-[4/3] w-full sm:aspect-[16/9]" />
          <SkeletonBlock className="mb-2 h-8 w-3/4" />
          <SkeletonBlock className="mb-6 h-5 w-1/2" />
          <SkeletonBlock className="mb-4 h-64 w-full" />
          <SkeletonBlock className="mb-4 h-48 w-full" />
          <SkeletonBlock className="mb-4 h-40 w-full" />
          <SkeletonBlock className="mb-4 h-80 w-full" />
          <SkeletonBlock className="mb-6 h-40 w-full" />
        </div>

        <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="flex gap-2">
              <SkeletonBlock className="h-10 w-20" />
              <SkeletonBlock className="h-10 w-20" />
            </div>
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </footer>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Error State                                                        */
/* ------------------------------------------------------------------ */

function ErrorSection({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { locale } = useLocale()
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('common.back', locale)}
            </Link>
          </div>
        </header>

        <div className="mx-auto mt-20 max-w-md px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FiAlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">{t('common.loadFailed', locale)}</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">{message}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            <FiRefreshCw className="h-4 w-4" />
            {t('common.reload', locale)}
          </button>
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptySection() {
  const { locale } = useLocale()
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <header className="border-b border-gray-100 bg-white/80">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('common.back', locale)}
            </Link>
          </div>
        </header>

        <div className="mx-auto mt-20 max-w-md px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FiPackage className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-gray-800">{t('detail.productNotFound', locale)}</h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            {t('detail.productNotFoundDesc', locale)}
          </p>
          <Link
            href="/global-supply"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500"
          >
            {t('detail.returnProductList', locale)}
          </Link>
        </div>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Data Transformer                                                   */
/* ------------------------------------------------------------------ */

function transformProductData(apiData: ApiProductResponse['data']): UIProductData {
  const supplier = apiData.supplier

  // Images
  const images = safeJsonParse<string[]>(apiData.images, [])
  if (images.length === 0) {
    images.push(productPlaceholderSVG(apiData.name || "商品", 800, 600, apiData.id))
  }

  // Enterprise info
  const certifications = safeJsonParse<string[]>(apiData.certifications, [])
  const businessTags = safeJsonParse<string[]>(supplier?.businessTags ?? null, [])
  const exportDests = safeJsonParse<string[]>(supplier?.exportDestinations ?? null, [])

  const annualExportVal = supplier?.annualExportRevenue ?? 0
  const annualExportDisplay = annualExportVal > 0
    ? `约 $${(annualExportVal / 100).toFixed(0)}M / 年`
    : ''

  // Price range
  const priceMin = apiData.priceMin ?? 0
  const priceMax = apiData.priceMax ?? 0
  const priceRange = `¥${priceMin} - ¥${priceMax}`

  // MOQ
  const moqDisplay = apiData.moq ? `${apiData.moq} 件` : '--'

  // Platforms from aggregatedReviews
  const platforms: Record<string, UIPlatformRating> = {}
  for (const ar of apiData.aggregatedReviews || []) {
    platforms[ar.platform] = {
      rating: ar.rating,
      reviewCount: ar.reviewCount,
      collectedAt: formatDate(ar.collectedAt),
    }
  }

  // Platform-derived reviews
  const reviews: UIReview[] = (apiData.aggregatedReviews || []).map((ar) => {
    const keywords = safeJsonParse<string[]>(ar.keywords, [])
    const content = keywords.length > 0
      ? `平台评分 ${ar.rating}/5，共 ${ar.reviewCount} 条评价。买家常提关键词：${keywords.slice(0, 4).join('、')}。`
      : `平台评分 ${ar.rating}/5，共 ${ar.reviewCount} 条评价。`
    return {
      id: `agg-${ar.id}`,
      username: `${ar.platform} 平台`,
      avatar: ar.platform.charAt(0),
      rating: ar.rating,
      content,
      time: formatDate(ar.collectedAt),
      platform: ar.platform,
    }
  })

  // Related products (from main API — fallback if separate category fetch fails)
  const relatedProducts: UIRelatedProduct[] = (apiData.relatedProducts || []).map((rp) => {
    const rpImages = safeJsonParse<string[]>(rp.images, [])
    return {
      id: String(rp.id),
      name: rp.name,
      image: rpImages[0] || productPlaceholderSVG(rp.name || "相关商品", 400, 300, rp.id),
      price: `¥${rp.priceMin ?? '?'} - ¥${rp.priceMax ?? '?'}`,
      rating: rp.rating ?? 0,
      reviews: rp.reviewCount ?? 0,
      supplier: rp.supplier?.nameZh ?? '',
    }
  })

  // Specs
  const specs: Record<string, string> = {}
  if (apiData.description) {
    specs['产品描述'] = apiData.description
  }
  if (apiData.supportsOEM) {
    specs['OEM 定制'] = '支持'
  }

  return {
    id: String(apiData.id),
    name: apiData.name,
    badges: supplier?.isVerified ? ['懒老板认证', '实地验厂'] : [],
    rating: apiData.rating ?? supplier?.rating ?? 0,
    reviewCount: apiData.reviewCount ?? supplier?.reviewCount ?? 0,
    dataUpdatedAt: formatDate(apiData.updatedAt),
    images,
    categoryId: apiData.categoryId,
    enterprise: {
      name: supplier?.nameZh ?? '',
      location: supplier?.location ?? '',
      established: supplier?.yearEstablished ?? 0,
      employeeCount: supplier?.employeeCount ?? 0,
      annualExport: annualExportDisplay,
      certifications,
      mainBusiness: businessTags.join('、'),
      exportDestinations: exportDests,
      partnerBrands: [],
      monthlyCapacity: '',
      deliveryCycle: '',
      paymentMethods: [],
    },
    product: {
      priceRange,
      moq: moqDisplay,
      dropshipping: apiData.supportsDropShipping,
      oem: apiData.supportsOEM,
      specs,
    },
    platforms,
    reviews,
    relatedProducts,
  }
}

function transformRelatedItem(item: RelatedListItem, currentId: number): UIRelatedProduct | null {
  if (item.id === currentId) return null
  const rpImages = safeJsonParse<string[]>(item.images, [])
  return {
    id: String(item.id),
    name: item.name,
    image: rpImages[0] || productPlaceholderSVG(item.name || "相关商品", 400, 300, item.id),
    price: `¥${item.priceMin ?? '?'} - ¥${item.priceMax ?? '?'}`,
    rating: item.rating ?? 0,
    reviews: item.reviewCount ?? 0,
    supplier: item.supplier?.nameZh ?? '',
  }
}

/* ------------------------------------------------------------------ */
/*  Recent Views Helpers                                               */
/* ------------------------------------------------------------------ */

interface RecentViewItem {
  id: string
  name: string
  image: string
  price: string
}

const RECENT_VIEWS_KEY = 'lanlaoban_recent_views'

function addToRecentViews(item: RecentViewItem) {
  try {
    const raw = localStorage.getItem(RECENT_VIEWS_KEY)
    let views: RecentViewItem[] = raw ? JSON.parse(raw) : []
    views = views.filter((v) => v.id !== item.id)
    views.unshift(item)
    views = views.slice(0, 5)
    localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(views))
  } catch {
    // Silently ignore
  }
}

function getRecentViews(): RecentViewItem[] {
  try {
    const raw = localStorage.getItem(RECENT_VIEWS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GlobalSupplyDetailPage() {
  const params = useParams()
  const id = String(params.id ?? '')
  const { locale } = useLocale()

  // 加载产品图片映射
  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<UIProductData | null>(null)
  const [supplierLinkId, setSupplierLinkId] = useState<number | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<UIRelatedProduct[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [recentViews, setRecentViews] = useState<RecentViewItem[]>([])
  const { isInCompare, toggleItem } = useCompare()
  const { showToast } = useToast()

  /* ---- Fetch product ---- */
  const fetchProduct = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/global-supply/products/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error(t('detail.productNotFound', locale) + ' · ' + t('detail.productNotFoundDesc', locale))
        throw new Error(t('common.loadFailed', locale) + ` (${res.status})`)
      }
      const json: ApiProductResponse = await res.json()
      if (!json.success || !json.data) {
        throw new Error(t('common.loadFailed', locale))
      }
      setProduct(transformProductData(json.data))
      setSupplierLinkId(json.data.supplier?.id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.loadFailed', locale) + '，' + t('common.retry', locale))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  /* ---- Fetch related products by category ---- */
  const fetchRelatedProducts = useCallback(async (categoryId: number) => {
    setRelatedLoading(true)
    try {
      const res = await fetch(`/api/global-supply/products?categoryId=${categoryId}&pageSize=8`)
      if (!res.ok) return
      const json: RelatedProductsResponse = await res.json()
      if (json.success && json.data?.items) {
        const currentId = Number(id)
        const items = json.data.items || []
        const mapped = items
          .map((item) => transformRelatedItem(item, currentId))
          .filter((item): item is UIRelatedProduct => item !== null)
        if (mapped.length > 0) {
          setRelatedProducts(mapped)
        }
      }
    } catch {
      // Silently ignore — related products are non-critical
    } finally {
      setRelatedLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (product && product.categoryId !== null) {
      fetchRelatedProducts(product.categoryId)
    }
  }, [product, fetchRelatedProducts])

  /* ---- Check favorite status ---- */
  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const t_ = localStorage.getItem('lanlaoban_token')
        const res = await fetch('/api/global-supply/collections', {
          headers: t_ ? { 'Authorization': `Bearer ${t_}` } : {},
        })
        if (!res.ok) return
        const json: CollectionsResponse = await res.json()
        if (json.success) {
          const found = json.data.some(
            (c) => c.targetType === 'product' && c.targetId === id,
          )
          setFavorited(found)
        }
      } catch {
        // Silently ignore — favorite check is non-critical
      }
    })()
  }, [id])

  /* ---- Recent Views ---- */
  useEffect(() => {
    if (!product || !id) return
    // Save current product to recent views
    const imgUrl = product.images[0] || productPlaceholderSVG(product.name, 400, 300, product.id)
    const price = product.product?.priceRange || '询价'
    addToRecentViews({ id, name: product.name, image: imgUrl, price })
    // Load recent views and exclude current product
    const views = getRecentViews().filter((v) => v.id !== id)
    setRecentViews(views)
  }, [id, product])

  /* ---- Toggle favorite ---- */
  const toggleFavorite = async () => {
    if (favoriteLoading) return
    const t_ = localStorage.getItem('lanlaoban_token')
    if (!t_) {
      showToast?.('请先登录，才能使用此功能', 'warning')
      return
    }
    setFavoriteLoading(true)
    try {
      const headers_: Record<string, string> = { 'Content-Type': 'application/json' }
      if (t_) headers_['Authorization'] = `Bearer ${t_}`
      if (favorited) {
        const res = await fetch('/api/global-supply/collections', {
          method: 'DELETE',
          headers: headers_,
          body: JSON.stringify({ targetId: id, targetType: 'product' }),
        })
        if (res.ok) {
          setFavorited(false)
          showToast('已取消收藏', 'info')
        }
      } else {
        const res = await fetch('/api/global-supply/collections', {
          method: 'POST',
          headers: headers_,
          body: JSON.stringify({ targetId: id, targetType: 'product' }),
        })
        if (res.ok) {
          setFavorited(true)
          showToast(' 已收藏到资源库', 'success')
        }
      }
    } catch {
      // Silently ignore
    } finally {
      setFavoriteLoading(false)
    }
  }

  /* ---- Add to Cart ---- */
  const addToCart = async () => {
    if (cartLoading) return
    const t_ = localStorage.getItem('lanlaoban_token')
    if (!t_) {
      showToast?.('请先登录，才能使用此功能', 'warning')
      return
    }
    setCartLoading(true)
    try {
      const res = await fetch('/api/global-supply/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t_}`,
        },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      })
      if (res.ok) {
        showToast('已加入采购清单', 'success')
      } else {
        const json = await res.json()
        showToast(json.error || '添加到采购清单失败，请稍后重试', 'warning')
      }
    } catch {
      showToast('操作失败，请稍后重试', 'error')
    } finally {
      setCartLoading(false)
    }
  }

  /* ---- State-based rendering ---- */

  // Loading
  if (loading) return <DetailSkeleton />

  // Error
  if (error) return <ErrorSection message={error} onRetry={fetchProduct} />

  // Empty (API returned 404 or null data without throwing)
  if (!product) return <EmptySection />

  /* ---- Derived data ---- */
  const relatedItemsForDisplay = relatedProducts.length > 0 ? relatedProducts : product.relatedProducts

  const compareItem: CompareItem = {
    id: product.id,
    name: product.name,
    image: productPlaceholderSVG(product.name, 200, 200, product.id),
    price: product.product?.priceRange,
    moq: product.product?.moq,
    dropship: product.product?.dropshipping,
    oem: product.product?.oem,
    rating: product.rating,
    location: product.enterprise?.location || '--',
  }
  const inCompare = isInCompare(product.id)

  /* ---- Main render ---- */
  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28 animate-fade-in">
        {/* ---- Header ---- */}
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
            <Link
              href="/global-supply"
              className="-ml-1 flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-brand-400"
            >
              <FiArrowLeft className="h-5 w-5" />
              {t('common.back', locale)}
            </Link>
            <span className="truncate text-sm font-semibold text-gray-900">
              {product.name}
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6">
          {/* ---- Breadcrumb ---- */}
          <Breadcrumb
            items={[
              { label: t('home.footer', locale), href: '/' },
              { label: t('nav.supply', locale), href: '/global-supply' },
              { label: product.name },
            ]}
            className="mb-4"
          />

          {/* ---- Image Carousel ---- */}
          <ImageCarousel images={product.images} />

          {/* ---- Title & Badges ---- */}
          <section className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(product.badges || []).map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600"
                >
                  {b === '懒老板认证' ? (
                    <FiShield className="h-3.5 w-3.5" />
                  ) : (
                    <FiCheckCircle className="h-3.5 w-3.5" />
                  )}
                  {b === '懒老板认证' ? t('detail.badge.verified', locale) : t('detail.badge.inspected', locale)}
                </span>
              ))}
            </div>
            {product.badges.includes('懒老板认证') && (
              <p className="mt-1.5 text-xs text-gray-500">
                {t('detail.verified', locale)}
              </p>
            )}
          </section>

          {/* ---- Rating & Timestamp ---- */}
          <section className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1">
              <StarRating value={product.rating} />
              <span className="ml-1 font-medium text-gray-700">
                {product.rating}
              </span>
              <span>({t('detail.platformReviews', locale).replace('{count}', product.reviewCount.toLocaleString())})</span>
            </span>
            {product.dataUpdatedAt && (
              <span className="inline-flex items-center gap-1">
                <FiClock className="h-3.5 w-3.5" />
                {t('detail.dataUpdatedAt', locale)} {product.dataUpdatedAt}
              </span>
            )}
          </section>

          {/* ---- Cards ---- */}

          {/* Company Info */}
          {product.enterprise?.name && (
            <section className="card mb-4">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                <FiGlobe className="h-5 w-5 text-brand-500" />
                {t('detail.companyInfo', locale)}
              </h2>
              <dl className="divide-y divide-gray-50">
                {product.enterprise?.name && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.enterpriseName', locale)}</dt>
                    <dd className="text-sm text-gray-900">
                      {supplierLinkId != null ? (
                        <Link
                          href={`/global-supply/suppliers/${supplierLinkId}`}
                          className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 hover:underline"
                        >
                          {product.enterprise.name}
                          <FiArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        product.enterprise.name
                      )}
                    </dd>
                  </div>
                )}
                {product.enterprise?.established > 0 && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.establishedYear', locale)}</dt>
                    <dd className="text-sm text-gray-900">
                      {product.enterprise.established}
                      <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        {t('detail.yearsExperience', locale).replace('{count}', String(new Date().getFullYear() - product.enterprise.established))}
                      </span>
                    </dd>
                  </div>
                )}
                {product.enterprise?.employeeCount > 0 && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.employeeCount', locale)}</dt>
                    <dd className="text-sm text-gray-900">{product.enterprise.employeeCount} {t('common.unitPeople', locale)}</dd>
                  </div>
                )}
                {product.enterprise?.location && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.location', locale)}</dt>
                    <dd className="inline-flex items-center gap-1 text-sm text-gray-900">
                      <FiMapPin className="h-3.5 w-3.5 text-brand-400" />
                      {product.enterprise.location}
                    </dd>
                  </div>
                )}
                {product.enterprise?.annualExport && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.annualExport', locale)}</dt>
                    <dd className="text-sm text-gray-900">{product.enterprise.annualExport}</dd>
                  </div>
                )}
                {product.enterprise?.certifications?.length > 0 && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.certifications', locale)}</dt>
                    <dd className="text-sm text-gray-900">
                      {(product.enterprise?.certifications || []).map((c) => (
                        <span
                          key={c}
                          className="mr-1.5 inline-block rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {c}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {product.enterprise?.mainBusiness && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.mainBusiness', locale)}</dt>
                    <dd className="text-sm text-gray-900">{product.enterprise.mainBusiness}</dd>
                  </div>
                )}
                {product.enterprise?.exportDestinations?.length > 0 && (
                  <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                    <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.exportDestinations', locale)}</dt>
                    <dd className="text-sm text-gray-900">{product.enterprise?.exportDestinations?.join(' / ')}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Product Info */}
          <section className="card mb-4">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
              <FiBarChart2 className="h-5 w-5 text-brand-500" />
              {t('detail.productInfo', locale)}
            </h2>
            <dl className="divide-y divide-gray-50">
              <div className="-mx-4 flex flex-col gap-0.5 bg-brand-50/40 px-4 py-3 sm:-mx-6 sm:flex-row sm:items-start sm:px-6">
                <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.priceRange', locale)}</dt>
                <dd className="text-lg font-bold text-brand-600">
                  <span className="inline-flex items-baseline gap-0.5">
                    <span>{product.product?.priceRange}</span>
                    <span className="text-xs text-gray-400">CNY / {t('common.unitPieces', locale)}</span>
                  </span>
                </dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.moq', locale)}</dt>
                <dd className="text-sm text-gray-900">{product.product?.moq}</dd>
              </div>
              <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.dropshipping', locale)}</dt>
                <dd className="text-sm text-gray-900">
                  {product.product?.dropshipping ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <FiCheckCircle className="h-3.5 w-3.5" />
                      {t('detail.supported', locale)}
                    </span>
                  ) : (
                    t('detail.notSupported', locale)
                  )}
                </dd>
              </div>
              {product.product?.oem && (
                <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                  <dt className="min-w-[7rem] text-sm text-gray-500">{t('detail.oem', locale)}</dt>
                  <dd className="text-sm text-gray-900">
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <FiCheckCircle className="h-3.5 w-3.5" />
                      {t('detail.supported', locale)}
                    </span>
                  </dd>
                </div>
              )}
              {Object.entries(product.product?.specs || {}).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-start">
                  <dt className="min-w-[7rem] text-sm text-gray-500">{k}</dt>
                  <dd className="text-sm text-gray-900">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Platform Reputation */}
          {Object.keys(product.platforms).length > 0 && (
            <section className="card mb-4">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                <FiThumbsUp className="h-5 w-5 text-brand-500" />
                {t('detail.reputation', locale)}
              </h2>
              <div className="space-y-4">
                {Object.entries(product.platforms || {}).map(([platform, data]) => (
                  <div
                    key={platform}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-bold text-white ${PLATFORM_COLORS[platform] || 'bg-gray-500'}`}
                      >
                        {platform}
                      </span>
                      <StarRating value={data.rating} />
                      <span className="text-sm font-medium text-gray-700">
                        {data.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{t('detail.platformReviews', locale).replace('{count}', data.reviewCount.toLocaleString())}</span>
                      {data.collectedAt && (
                        <span className="inline-flex items-center gap-1">
                          <FiClock className="h-3 w-3" />
                          {data.collectedAt}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Buyer Reviews */}
          {(product.reviews?.length || 0) > 0 && (
            <section className="card mb-4">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                <FiMessageSquare className="h-5 w-5 text-brand-500" />
                {t('detail.reviews.title', locale)}
              </h2>
              <div className="space-y-5">
                {(product.reviews || []).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-gray-100/80 bg-white px-4 py-3.5 shadow-apple transition-all duration-300 hover:border-gray-200 hover:shadow-apple-md"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                          {review.avatar}
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">
                            {review.username}
                          </span>
                          {review.platform && (
                            <span
                              className={`ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white ${PLATFORM_COLORS[review.platform] || 'bg-gray-500'}`}
                            >
                              {review.platform}
                            </span>
                          )}
                        </div>
                      </div>
                      {review.time && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400">
                          <FiCalendar className="h-3 w-3" />
                          {review.time}
                        </span>
                      )}
                    </div>

                    <div className="mb-1.5">
                      <StarRating value={review.rating} />
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600">
                      &ldquo;{review.content}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Connectable Resources */}
          {product.enterprise?.name && (
            <section className="card mb-4">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
                <FiTruck className="h-5 w-5 text-brand-500" />
                {t('detail.resources', locale)}
              </h2>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-8 text-center">
                <FiPackage className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">
                  {t('detail.noResources', locale)}
                </p>
              </div>
            </section>
          )}

          {/* ---- CTA Section ---- */}
          <section className="mt-8">
            <div className="rounded-2xl bg-gradient-to-br from-brand-50 via-white to-purple-50/40 p-6 shadow-apple border border-brand-100/50">
              <h3 className="mb-5 text-center text-lg font-bold text-gray-800">
                {t('detail.interested', locale)}
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-500"
                >
                  <FiMessageSquare className="w-5 h-5" />
                  {t('detail.contactFactory', locale)}
                </button>
                <button
                  onClick={addToCart}
                  disabled={cartLoading}
                  className="flex items-center justify-center gap-2 rounded-lg border-2 border-brand-400 px-8 py-3 text-base font-bold text-brand-600 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiShoppingCart className={`w-5 h-5 ${cartLoading ? 'animate-pulse' : ''}`} />
                  {cartLoading ? t('detail.addingToCart', locale) : t('detail.addToList', locale)}
                </button>
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 px-8 py-3 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    favorited
                      ? 'border-brand-400 bg-brand-50 text-brand-600'
                      : 'border-brand-400 text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  <FiHeart className={`w-5 h-5 ${favorited ? 'fill-brand-400 text-brand-400' : ''}`} />
                  {favorited ? t('detail.saved', locale) : t('detail.save', locale)}
                </button>
              </div>
            </div>
          </section>

          {/* ---- Related Products ---- */}
          {relatedItemsForDisplay.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <FiPackage className="h-5 w-5 text-brand-400" />
                {t('detail.related', locale)}
                {relatedLoading && (
                  <FiRefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                )}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedItemsForDisplay.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/global-supply/${rel.id}`}
                    className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
                      <OptimizedImage
                        src={rel.image}
                        alt={rel.name}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3.5">
                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-500">
                        {rel.name}
                      </h3>
                      {rel.supplier && (
                        <p className="mb-2 truncate text-xs text-gray-400">
                          {rel.supplier}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-brand-600">
                          {rel.price}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {rel.rating}
                          {rel.reviews > 0 && (
                            <>
                              <span className="text-gray-300">|</span>
                              {rel.reviews.toLocaleString()}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ---- 看了又看 (Recent Views) ---- */}
          {recentViews.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <FiEye className="h-5 w-5 text-brand-400" />
                看了又看
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentViews.map((rv) => (
                  <Link
                    key={rv.id}
                    href={`/global-supply/${rv.id}`}
                    className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
                      <OptimizedImage
                        src={rv.image}
                        alt={rv.name}
                        className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3.5">
                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-800 group-hover:text-brand-500">
                        {rv.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-brand-600">
                          {rv.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ---- AI TikTok Video CTA ---- */}
          <section className="mt-6">
            <button
              onClick={() => setVideoModalOpen(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98]"
            >
              <FiZap className="h-6 w-6" />
              {t('detail.aiVideo', locale)}
            </button>
          </section>

          {/* ---- Back to Supply ---- */}
          <div className="mt-6 text-center">
            <Link
              href="/global-supply"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 transition-colors hover:text-brand-500"
            >
              <FiArrowLeft className="h-4 w-4" />
              {t('detail.backToSupply', locale)}
            </Link>
          </div>

          {/* Data source disclaimer */}
          <div className="mt-6 mb-4 text-center text-xs text-gray-400">
            {t('detail.dataSource', locale)} {formatDate(new Date().toISOString())}
          </div>
        </div>

        {/* ---- Bottom Action Bar ---- */}
        <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                aria-label={t('detail.save', locale)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] ${
                  favorited
                    ? 'border-brand-400 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <FiHeart
                  className={`h-4 w-4 ${favorited ? 'fill-brand-400 text-brand-400' : ''}`}
                />
                {favorited ? t('detail.saved', locale) : t('detail.save', locale)}
              </button>

              <button
                onClick={addToCart}
                disabled={cartLoading}
                aria-label={t('common.loginToCart', locale)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 sm:px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
              >
                <FiShoppingCart className={`h-4 w-4 ${cartLoading ? 'animate-pulse' : ''}`} />
                {cartLoading ? t('detail.addingToCart', locale) : t('detail.addToList', locale)}
              </button>

              <button
                onClick={() => { toggleItem(compareItem); setCompareDrawerOpen(true) }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
                  inCompare
                    ? 'border-brand-400 bg-brand-50 text-brand-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <FiPlus className="h-4 w-4" />
                {inCompare ? t('detail.alreadyCompared', locale) : t('detail.addCompare', locale)}
              </button>

              <button aria-label={t('detail.share', locale)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 sm:px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 min-h-[44px]">
                <FiShare2 className="h-4 w-4" />
                {t('detail.share', locale)}
              </button>
            </div>

            <button
              onClick={() => setContactModalOpen(true)}
              aria-label={t('supplier.contact', locale)}
              className="flex-1 rounded-lg bg-brand-400 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-500 sm:flex-initial sm:px-10 min-h-[44px]"
            >
              {t('detail.contactFactory', locale)}
            </button>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        supplierName={product.enterprise?.name}
        productId={Number(product.id)}
      />
      <VideoGenerateModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        productName={product.name}
      />
      <CompareDrawer open={compareDrawerOpen} onClose={() => setCompareDrawerOpen(false)} />
    </>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FiSearch,
  FiStar,
  FiTruck,
  FiPackage,
  FiShoppingBag,
  FiGrid,
  FiArrowRight,
  FiGlobe,
  FiAward,
  FiRefreshCw,
  FiMapPin,
  FiTrendingUp,
  FiChevronRight,
} from 'react-icons/fi'
import { useLocale } from '@/app/contexts/LocaleContext'
import { t } from '@/lib/i18n'
import { productPlaceholderSVG, loadProductImageMap, setProductImageMap } from '@/lib/product-placeholder'

/* ─── Types ─────────────────────────────────────── */

interface HomeStats {
  suppliers: number
  products: number
  categories: number
}

interface ProductCategory {
  id: number
  name: string
  icon: string | null
  productCount: number
}

interface VerifiedSupplier {
  id: number
  nameZh: string | null
  location: string | null
  businessTags: string | null
  rating: number | null
  reviewCount: number | null
  isVerified: boolean
}

interface ProductItem {
  id: number
  name: string
  priceMin: number | null
  priceMax: number | null
  location: string | null
  rating: number | null
  reviewCount: number | null
}

/* ─── Constants ──────────────────────────────────── */

const HOT_SEARCH_TAGS: string[] = [
  '蓝牙耳机',
  '陶瓷餐具',
  '充电宝',
  '工厂代工',
  '跨境物流',
  '现货采购',
  '一件代发',
  '品牌代工',
]

type SceneCardData = {
  icon: React.ComponentType<{ className?: string }>
  titleKey: string
  descKey: string
  href: string
}

const SCENE_CARDS: SceneCardData[] = [
  { icon: FiPackage, titleKey: 'supply.scene.factory', descKey: 'supply.scene.factoryDesc', href: '/global-supply/search?q=工厂代工' },
  { icon: FiShoppingBag, titleKey: 'supply.scene.spot', descKey: 'supply.scene.spotDesc', href: '/global-supply/search?q=现货采购' },
  { icon: FiTruck, titleKey: 'supply.scene.logistics', descKey: 'supply.scene.logisticsDesc', href: '/global-supply/search?q=跨境物流' },
  { icon: FiGlobe, titleKey: 'supply.scene.platform', descKey: 'supply.scene.platformDesc', href: '/global-supply/search?q=上架海外平台' },
  { icon: FiTrendingUp, titleKey: 'supply.scene.channel', descKey: 'supply.scene.channelDesc', href: '/global-supply/search?q=对接海外渠道' },
]

/* ─── Helpers ────────────────────────────────────── */

function extractRegion(location: string | null): string {
  if (!location) return '海外'
  if (/广东|深圳|广州/.test(location)) return '华南'
  if (/浙江|义乌|江苏|福建/.test(location)) return '华东'
  if (/山东|北京|天津|河北/.test(location)) return '华北'
  if (/四川|重庆/.test(location)) return '西南'
  if (/湖北|湖南/.test(location)) return '华中'
  if (/辽宁|吉林|黑龙江/.test(location)) return '东北'
  return location
}

function unsafeCastArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : []
}

function safeString(val: unknown, fallback: string): string
function safeString(val: unknown, fallback: string | null): string | null
function safeString(val: unknown, fallback: string | null): string | null {
  return typeof val === 'string' ? val : fallback
}

function safeNumber(val: unknown, fallback: number): number
function safeNumber(val: unknown, fallback: number | null): number | null
function safeNumber(val: unknown, fallback: number | null): number | null {
  return typeof val === 'number' ? val : fallback
}



/* ═══════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════ */

export default function GlobalSupplyPage() {
  const { locale } = useLocale()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<HomeStats>({
    suppliers: 0,
    products: 0,
    categories: 0,
  })
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [suppliers, setSuppliers] = useState<VerifiedSupplier[]>([])
  const [hotProducts, setHotProducts] = useState<ProductItem[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/global-supply/home')
      if (!res.ok) {
        throw new Error('服务器响应异常，请稍后重试')
      }

      const json: unknown = await res.json()

      // Unwrap: json?.data || json || {}
      const raw = (json as Record<string, unknown>) ?? {}
      const data = ((raw?.data as Record<string, unknown>) ?? raw) as Record<string, unknown>

      // Stats
      const rawStats = data.stats as Record<string, unknown> | undefined
      setStats({
        suppliers: safeNumber(rawStats?.suppliers, 0),
        products: safeNumber(rawStats?.products, 0),
        categories: safeNumber(rawStats?.categories, 0),
      })

      // Product categories (from home API's productCategories field)
      const rawCategories = unsafeCastArray(data.productCategories)
      setCategories(
        rawCategories.map((item: unknown) => {
          const c = item as Record<string, unknown>
          return {
            id: safeNumber(c.id, 0),
            name: safeString(c.name, ''),
            icon: safeString(c.icon, null) ?? null,
            productCount: safeNumber(c.productCount, 0),
          }
        }),
      )

      // Verified suppliers
      const rawSuppliers = unsafeCastArray(data.verifiedSuppliers)
      setSuppliers(
        rawSuppliers.map((item: unknown) => {
          const s = item as Record<string, unknown>
          return {
            id: safeNumber(s.id, 0),
            nameZh: safeString(s.nameZh, null) ?? null,
            location: safeString(s.location, null) ?? null,
            businessTags: safeString(s.businessTags, null) ?? null,
            rating: safeNumber(s.rating, null) ?? null,
            reviewCount: safeNumber(s.reviewCount, null) ?? null,
            isVerified: s.isVerified === true,
          }
        }),
      )

      // Hot products (silently degrade on failure)
      try {
        const prodRes = await fetch('/api/global-supply/products?pageSize=8&sortBy=rating')
        if (prodRes.ok) {
          const prodJson: unknown = await prodRes.json()
          const raw = prodJson as Record<string, unknown>
          const d = raw?.data as Record<string, unknown> | undefined
          const items = unsafeCastArray(
            (d?.items as unknown[]) ?? (raw?.data as unknown[]) ?? [],
          )
          setHotProducts(
            items.map((item: unknown) => {
              const p = item as Record<string, unknown>
              return {
                id: safeNumber(p.id, 0),
                name: safeString(p.name, ''),
                priceMin: safeNumber(p.priceMin, null) ?? null,
                priceMax: safeNumber(p.priceMax, null) ?? null,
                location: safeString(p.location, null) ?? null,
                rating: safeNumber(p.rating, null) ?? null,
                reviewCount: safeNumber(p.reviewCount, null) ?? null,
              }
            }),
          )
        }
      } catch {
        // silently degrade
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 加载产品图片映射
  useEffect(() => {
    loadProductImageMap().then(setProductImageMap)
  }, [])

  const handleSearch = (): void => {
    const q = searchQuery.trim()
    if (q) {
      window.location.href = `/global-supply/search?q=${encodeURIComponent(q)}`
    }
  }

  /* ── Loading ────────────────────────────────── */
  if (loading) return <Skeleton />

  /* ── Error ──────────────────────────────────── */
  if (error) return <ErrorState error={error} onRetry={fetchData} />

  /* ── Main Content ───────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 sm:py-3 text-xs text-gray-400">
        懒老板 <FiChevronRight className="mx-1 inline h-3 w-3" /> {t('supply.breadcrumb', locale)}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        {/* 1. Hero Search */}
        <HeroSearchSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* 2. Data Confidence Bar */}
        <StatsBar stats={stats} />

        {/* 3. Browse by Industry */}
        <IndustryGrid categories={categories} />

        {/* 4. Find Resources by Scenario */}
        <SceneCards />

        {/* 5. Curated Suppliers */}
        <VerifiedSupplierSection suppliers={suppliers} />

        {/* 6. Hot Recommendations */}
        <HotRecommendation products={hotProducts} />

        {/* Footer note */}
        <DataSourceSection />
      </div>

      <FooterSection />
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════ */

/* ─── Skeleton ──────────────────────────────────── */

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-3">
        {/* Nav skeleton */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
            <div className="hidden h-4 w-10 animate-pulse rounded bg-gray-200 sm:block" />
          </div>
        </div>

        {/* Hero skeleton */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gray-100 px-8 py-14">
          <div className="mx-auto mb-4 h-9 w-52 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto mb-6 h-4 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mx-auto h-12 max-w-xl animate-pulse rounded-xl bg-white" />
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mx-auto mb-3 h-5 w-5 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mb-1 h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto h-4 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Categories skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Scene cards skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-3 h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                <div className="mb-1 h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
                <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Hot products skeleton */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="aspect-square w-full animate-pulse bg-gray-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Error State ───────────────────────────────── */

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { locale } = useLocale()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="px-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <FiRefreshCw className="h-7 w-7 text-red-400" />
        </div>
        <p className="mb-2 text-sm text-gray-600">{t('common.loadFailed', locale)}</p>
        <p className="mb-6 text-xs text-gray-400">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-90"
          style={{ backgroundColor: '#FF6034' }}
        >
          <FiRefreshCw className="h-4 w-4" />
          {t('common.reload', locale)}
        </button>
      </div>
    </div>
  )
}

/* ─── Hero Search Section ────────────────────────── */

function HeroSearchSection({
  searchQuery,
  onSearchChange,
  onSearch,
}: {
  searchQuery: string
  onSearchChange: (v: string) => void
  onSearch: () => void
}) {
  const { locale } = useLocale()
  return (
    <section
      className="relative mb-6 overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-8 sm:py-14"
      style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)' }}
      aria-label={t('supply.hero.title', locale)}
    >
      {/* Decorative circles */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10"
        style={{ backgroundColor: '#FF6034' }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-10"
        style={{ backgroundColor: '#FF6034' }}
      />

      <h1 className="relative mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
        {t('supply.hero.title', locale)}
      </h1>
      <p className="relative mb-6 text-sm text-gray-500 sm:text-base">
        {t('supply.hero.subtitle', locale)}
      </p>

      {/* Search bar */}
      <div className="relative mx-auto max-w-xl">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-3.5 shadow-sm transition-all focus-within:shadow-[0_0_0_3px_rgba(255,96,52,0.15)] focus-within:border-brand-200">
          <FiSearch className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            type="text"
            placeholder={t('supply.hero.searchPlaceholder', locale)}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
          />
          <button
            onClick={onSearch}
            className="shrink-0 rounded-xl px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FF6034' }}
          >
            {t('supply.hero.searchButton', locale)}
          </button>
        </div>
      </div>

      {/* Hot search tags */}
      <div className="relative mt-4 flex flex-wrap justify-center gap-2">
        {(HOT_SEARCH_TAGS || []).map((tag) => (
          <Link
            key={tag}
            href={`/global-supply/search?q=${encodeURIComponent(tag)}`}
            className="inline-block rounded-full border border-brand-100 bg-white/60 px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:border-brand-300 hover:bg-white hover:text-brand-400"
          >
            {tag}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Stats Bar (Data Confidence) ────────────────── */

function StatsBar({ stats }: { stats: HomeStats }) {
  const { locale } = useLocale()
  const items: {
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { label: t('supply.stats.suppliers', locale), value: stats.suppliers, icon: FiTruck },
    { label: t('supply.stats.products', locale), value: stats.products, icon: FiPackage },
    { label: t('supply.stats.categories', locale), value: stats.categories, icon: FiGrid },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
      {(items || []).map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100/80 bg-white p-4 sm:p-5 text-center shadow-apple transition-all duration-300 hover:shadow-apple-md"
          >
            <div className="mb-2 flex justify-center">
              <Icon className="h-5 w-5 text-brand-400" />
            </div>
            <div className="mb-0.5 text-2xl font-bold text-brand-500 sm:text-3xl">
              {item.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 sm:text-sm">{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Industry Grid (按行业逛) ───────────────────── */

function IndustryGrid({ categories }: { categories: ProductCategory[] }) {
  const { locale } = useLocale()
  if ((categories || []).length === 0) {
    return (
      <section className="mb-8" aria-label={t('supply.industry.title', locale)}>
        <SectionHeader icon={FiGrid} title={t('supply.industry.title', locale)} />
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          {t('supply.industry.empty', locale)}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8" aria-label={t('supply.industry.title', locale)}>
      <SectionHeader icon={FiGrid} title={t('supply.industry.title', locale)} href="/global-supply/categories" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(categories || []).map((cat, idx) => (
          <Link
            key={cat.id}
            href={`/global-supply/search?q=${encodeURIComponent(cat.name)}`}
            className="animate-stagger group rounded-2xl border border-gray-100/80 bg-white p-4 shadow-apple transition-all duration-300 hover:border-brand-100 hover:shadow-apple-md hover:bg-gradient-to-br hover:from-brand-50 hover:to-orange-50 sm:p-5"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <h3 className="mb-1 text-sm font-semibold text-gray-900 group-hover:text-brand-400 sm:text-base">
              {cat.name}
            </h3>
            <p className="text-xs text-gray-400">
              <span className="font-medium text-brand-400">
                {cat.productCount.toLocaleString()}
              </span>{' '}
              {t('supply.industry.productCount', locale)}
            </p>
            <div className="mt-3 flex items-center gap-0.5 text-[10px] text-gray-300 group-hover:text-brand-200">
              <span>{t('supply.industry.browse', locale)}</span>
              <FiArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Scene Cards (按场景找资源) ─────────────────── */

function SceneCards() {
  const { locale } = useLocale()
  return (
    <section className="mb-8" aria-label={t('supply.scene.title', locale)}>
      <SectionHeader icon={FiSearch} title={t('supply.scene.title', locale)} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(SCENE_CARDS || []).map((scene, idx) => {
          const Icon = scene.icon
          return (
            <Link
              key={scene.titleKey}
              href={scene.href}
              className="animate-stagger group rounded-2xl border border-gray-100/80 bg-white p-4 sm:p-5 shadow-apple transition-all duration-300 hover:border-brand-100 hover:shadow-apple-md"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 transition-colors group-hover:bg-brand-100">
                <Icon className="h-5 w-5 text-brand-400" />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-gray-900">{t(scene.titleKey, locale)}</h3>
              <p className="text-xs leading-relaxed text-gray-400">{t(scene.descKey, locale)}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Verified Suppliers (懒老板精选供应商) ──────── */

function VerifiedSupplierSection({
  suppliers,
}: {
  suppliers: VerifiedSupplier[]
}) {
  const { locale } = useLocale()
  if ((suppliers || []).length === 0) {
    return (
      <section className="mb-8" aria-label={t('supply.supplier.title', locale)}>
        <SectionHeader icon={FiAward} title={t('supply.supplier.title', locale)} />
        <div className="rounded-xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          {t('supply.supplier.empty', locale)}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8" aria-label={t('supply.supplier.title', locale)}>
      <SectionHeader
        icon={FiAward}
        title={t('supply.supplier.title', locale)}
        href="/global-supply/suppliers"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(suppliers || []).slice(0, 6).map((s, idx) => (
          <Link
            key={s.id}
            href={`/global-supply/suppliers/${s.id}`}
            className="animate-stagger group rounded-2xl border border-gray-100/80 bg-white p-5 shadow-apple transition-all duration-300 hover:border-amber-100 hover:shadow-apple-md"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="mb-3 flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base font-bold text-brand-400 sm:h-12 sm:w-12 transition-colors group-hover:bg-amber-50 group-hover:text-amber-500">
                {(s.nameZh || '供').charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm font-semibold text-gray-900">
                    {s.nameZh || t('supply.supplier.verified', locale)}
                  </h3>
                  {s.isVerified && (
                    <FiAward
                      className="h-4 w-4 shrink-0 text-amber-500"
                      title={t('supply.supplier.verified', locale)}
                    />
                  )}
                </div>
                {s.location && (
                  <p className="flex items-center gap-1 truncate text-xs text-gray-400">
                    <FiMapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{s.location}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
              <FiStar className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium">
                {s.rating != null ? s.rating.toFixed(1) : '--'}
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {(s.reviewCount ?? 0).toLocaleString()} {t('supply.supplier.reviewCount', locale)}
              </span>
            </div>

            {s.businessTags && (
              <div className="flex flex-wrap gap-1.5">
                {String(s.businessTags)
                  .split(/[,，、]/)
                  .slice(0, 3)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Hot Recommendation Products ──────────────────── */

function HotRecommendation({ products }: { products: ProductItem[] }) {
  const { locale } = useLocale()
  if ((products || []).length === 0) return null

  return (
    <section className="mb-8" aria-label={t('supply.hot.title', locale)}>
      <SectionHeader icon={FiTrendingUp} title={t('supply.hot.title', locale)} subtitle={t('supply.hot.subtitle', locale)} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(products || []).slice(0, 8).map((p, idx) => (
          <Link
            key={p.id}
            href={`/global-supply/${p.id}/${p.id}`}
            className="animate-stagger group overflow-hidden rounded-2xl border border-gray-100/80 bg-white shadow-apple transition-all duration-300 hover:border-brand-100 hover:shadow-apple-md"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Product image */}
            <div className="aspect-square w-full overflow-hidden bg-gray-50">
              <img
                src={productPlaceholderSVG(p.name, 300, 300, p.id)}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Product info */}
            <div className="space-y-1.5 p-3">
              <h3 className="truncate text-sm font-medium text-gray-900 line-clamp-1">
                {p.name || t('supply.product.name', locale)}
              </h3>

              {/* Price range */}
              {p.priceMin != null && p.priceMax != null && (
                <p className="text-sm font-semibold" style={{ color: '#FF6034' }}>
                  ¥{p.priceMin}
                  {p.priceMax !== p.priceMin && (
                    <span className="text-xs text-gray-400 font-normal"> - ¥{p.priceMax}</span>
                  )}
                </p>
              )}

              {/* Location + Rating */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                {p.location ? (
                  <span className="truncate">{extractRegion(p.location)}</span>
                ) : (
                  <span />
                )}
                {p.rating != null && (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <FiStar className="h-3 w-3 text-amber-400" />
                    <span className="font-medium text-gray-600">{p.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Reusable Section Header ────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  href?: string
}) {
  const { locale } = useLocale()
  if (href) {
    return (
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-brand-400" />
          <div>
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-brand-400 hover:underline"
        >
          {t('supply.viewAll', locale)} <FiArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-5 w-5 text-brand-400" />
      <div>
        <h2 className="text-base font-bold text-gray-900 sm:text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

/* ─── Data Source Declaration ────────────────────── */

function DataSourceSection() {
  const { locale } = useLocale()
  const [dateStr, setDateStr] = useState('')
  useEffect(() => {
    const d = new Date()
    setDateStr(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }, [])
  return (
    <div className="mb-4 rounded-2xl border border-gray-100/80 bg-white p-5 text-center text-xs text-gray-400">
      {t('supply.dataSource', locale)} {dateStr}
    </div>
  )
}

/* ─── Footer ─────────────────────────────────────── */

function FooterSection() {
  const { locale } = useLocale()
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-center text-sm text-gray-400">
        {t('home.footer', locale)}
      </div>
    </footer>
  )
}
